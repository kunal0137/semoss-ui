import { Button } from "@semoss/ui/next";
import { isRecord } from "@semoss/utility/object";
import { useA2uiSurface } from "../a2ui-surface.context";
import {
	failedChecks,
	isFunctionCall,
	resolveString,
	resolveValue,
} from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";

const VARIANTS = {
	primary: "default",
	default: "outline",
	borderless: "ghost",
} as const;

/** The URL a button may open: https only, so an agent cannot reach `javascript:` or `data:`. */
const toSafeUrl = (value: unknown): string | null => {
	if (typeof value !== "string") {
		return null;
	}
	try {
		const url = new URL(value);
		return url.protocol === "https:" ? url.href : null;
	} catch {
		return null;
	}
};

/**
 * `Button`: its label is its child, and its action is either an event for the
 * assistant or `openUrl`. Nothing here runs without a click, and a button with
 * failing `checks` cannot be pressed.
 */
export const A2uiButton = ({
	component,
	scope,
	renderChild,
}: A2uiAdapterProps) => {
	const { surface, dataModel, isInteractive, dispatch } = useA2uiSurface();
	const child =
		typeof component.child === "string" &&
		Object.hasOwn(surface.components, component.child)
			? surface.components[component.child]
			: undefined;
	// A text child is the label itself; a paragraph inside a button is not valid HTML.
	const label =
		child?.component === "Text"
			? resolveString(child.text, dataModel, scope)
			: null;
	const action = isRecord(component.action) ? component.action : {};
	const event = isRecord(action.event) ? action.event : undefined;
	const call = isFunctionCall(action.functionCall)
		? action.functionCall
		: undefined;
	const openUrl =
		call?.call === "openUrl" && isRecord(call.args)
			? toSafeUrl(resolveValue(call.args.url, dataModel, scope))
			: null;
	const isBlocked =
		failedChecks(component.checks, dataModel, scope).length > 0;
	const canAct = event ? isInteractive : openUrl !== null;

	const handleClick = () => {
		if (event && typeof event.name === "string") {
			const context: Record<string, unknown> = {};
			if (isRecord(event.context)) {
				for (const [key, value] of Object.entries(event.context)) {
					context[key] = resolveValue(value, dataModel, scope);
				}
			}
			dispatch({
				name: event.name,
				surfaceId: surface.id,
				sourceComponentId: component.id,
				context,
				dataModel,
			});
		} else if (openUrl) {
			window.open(openUrl, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Button
			type="button"
			variant={
				typeof component.variant === "string" &&
				Object.hasOwn(VARIANTS, component.variant)
					? VARIANTS[component.variant as keyof typeof VARIANTS]
					: "outline"
			}
			disabled={!canAct || isBlocked}
			onClick={handleClick}
			className="w-fit max-w-full"
		>
			{label ?? renderChild(component.child)}
		</Button>
	);
};
