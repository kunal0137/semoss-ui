import { isRecord } from "@semoss/utility/object";
import type { A2uiBinding, A2uiFunctionCall, A2uiScope } from "../a2ui.types";
import { readPointer } from "../protocol/a2ui-pointer";
import { callA2uiFunction } from "./a2ui-functions";

/** The scope outside any template. */
export const ROOT_SCOPE: A2uiScope = { base: "" };

/** Whether a value is a data binding, `{ path }`. */
export const isBinding = (value: unknown): value is A2uiBinding =>
	isRecord(value) && typeof value.path === "string" && !("call" in value);

/** Whether a value is a function call, `{ call, args? }`. */
export const isFunctionCall = (value: unknown): value is A2uiFunctionCall =>
	isRecord(value) && typeof value.call === "string";

/**
 * The absolute pointer a path names: `/x` is the model's own, anything else
 * is read from the template item the component sits in.
 *
 * @param path - A path from a binding or a template.
 * @param scope - Where the component sits.
 * @return A pointer from the root of the data model.
 */
export const toAbsolutePath = (path: string, scope: A2uiScope): string => {
	if (path.startsWith("/")) {
		return path;
	}
	return `${scope.base}/${path}`.replace(/\/+$/, "") || "/";
};

/**
 * Reads a dynamic value: a literal comes back as it is, a binding reads the
 * data model, a function call runs.
 *
 * @param value - What a component property holds.
 * @param dataModel - The surface's data model.
 * @param scope - Where the component sits.
 * @return The value, or `undefined` when a path or function has none.
 */
export const resolveValue = (
	value: unknown,
	dataModel: unknown,
	scope: A2uiScope = ROOT_SCOPE,
): unknown => {
	if (isFunctionCall(value)) {
		return callA2uiFunction(value, (arg) =>
			resolveValue(arg, dataModel, scope),
		);
	}
	if (isBinding(value)) {
		return readPointer(dataModel, toAbsolutePath(value.path, scope));
	}
	return value;
};

/** A dynamic string; an empty one when there is none, and the text of a number or boolean. */
export const resolveString = (
	value: unknown,
	dataModel: unknown,
	scope?: A2uiScope,
): string => {
	const resolved = resolveValue(value, dataModel, scope);
	return typeof resolved === "string" ||
		typeof resolved === "number" ||
		typeof resolved === "boolean"
		? String(resolved)
		: "";
};

/** A dynamic boolean, `undefined` when it is not one. */
export const resolveBoolean = (
	value: unknown,
	dataModel: unknown,
	scope?: A2uiScope,
): boolean | undefined => {
	const resolved = resolveValue(value, dataModel, scope);
	return typeof resolved === "boolean" ? resolved : undefined;
};

/** A dynamic number, `undefined` when it is not a finite one. */
export const resolveNumber = (
	value: unknown,
	dataModel: unknown,
	scope?: A2uiScope,
): number | undefined => {
	const resolved = resolveValue(value, dataModel, scope);
	return typeof resolved === "number" && Number.isFinite(resolved)
		? resolved
		: undefined;
};

/** A dynamic list of strings; empty when there is none. */
export const resolveStringList = (
	value: unknown,
	dataModel: unknown,
	scope?: A2uiScope,
): string[] => {
	const resolved = resolveValue(value, dataModel, scope);
	return Array.isArray(resolved)
		? resolved.filter((item): item is string => typeof item === "string")
		: [];
};

/** A check on an input: it passes while `condition` is true. */
export interface A2uiCheck {
	condition: unknown;
	message: string;
}

/**
 * The messages of the checks that fail. A check whose condition cannot be
 * evaluated passes: a function this renderer lacks must not lock a form.
 *
 * @param checks - A component's `checks` property.
 * @param dataModel - The surface's data model.
 * @param scope - Where the component sits.
 * @return A message for each failing check, in order.
 */
export const failedChecks = (
	checks: unknown,
	dataModel: unknown,
	scope?: A2uiScope,
): string[] => {
	if (!Array.isArray(checks)) {
		return [];
	}
	return checks.flatMap((check): string[] => {
		if (!isRecord(check) || typeof check.message !== "string") {
			return [];
		}
		return resolveValue(check.condition, dataModel, scope) === false
			? [check.message]
			: [];
	});
};
