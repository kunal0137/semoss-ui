import { useState } from "react";
import type { A2uiScope } from "../a2ui.types";
import { useA2uiSurface } from "../a2ui-surface.context";
import {
	failedChecks,
	isBinding,
	resolveValue,
	toAbsolutePath,
} from "../binding/a2ui-binding";

/** What {@link useA2uiInput} returns. */
export interface A2uiInput {
	/** The value as the data model, or the user's own edit, holds it. */
	value: unknown;
	/** Records the user's edit. */
	setValue: (next: unknown) => void;
	/** The messages of the checks that fail, once the user has been in the field. */
	errors: string[];
	/** Marks the field visited, so its checks show. */
	touch: () => void;
	/** Whether the surface lets the user act. */
	isDisabled: boolean;
}

/**
 * The state of one input component. A value bound to the data model is read
 * from it and written back to it, so the model's `checks` and any button's
 * context see what the user typed. A literal value is only the starting
 * point: the edit stays in the field, and nothing sends it.
 *
 * @param raw - The component's `value` property.
 * @param checks - The component's `checks` property.
 * @param scope - Where the component sits.
 * @return The input's state.
 */
export const useA2uiInput = (
	raw: unknown,
	checks: unknown,
	scope: A2uiScope,
): A2uiInput => {
	const { dataModel, setValue: writeModel, isInteractive } = useA2uiSurface();
	const [local, setLocal] = useState<unknown>(() =>
		resolveValue(raw, dataModel, scope),
	);
	const [isTouched, setIsTouched] = useState(false);
	const bound = isBinding(raw);
	return {
		value: bound ? resolveValue(raw, dataModel, scope) : local,
		setValue: (next) => {
			if (bound) {
				writeModel(toAbsolutePath(raw.path, scope), next);
			} else {
				setLocal(next);
			}
			setIsTouched(true);
		},
		errors: isTouched ? failedChecks(checks, dataModel, scope) : [],
		touch: () => setIsTouched(true),
		isDisabled: !isInteractive,
	};
};
