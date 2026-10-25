import { useId } from "react";
import { Checkbox, Field, FieldError, FieldLabel } from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { useA2uiInput } from "./use-a2ui-input";

/** `CheckBox`: a labelled yes or no, bound to the data model. */
export const A2uiCheckBox = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const input = useA2uiInput(component.value, component.checks, scope);
	const id = useId();
	const errorId = `${id}-error`;
	return (
		<Field orientation="horizontal" className="min-w-0">
			<Checkbox
				id={id}
				checked={input.value === true}
				disabled={input.isDisabled}
				onCheckedChange={(checked) => input.setValue(checked === true)}
				aria-invalid={input.errors.length > 0}
				aria-describedby={input.errors.length > 0 ? errorId : undefined}
			/>
			<FieldLabel htmlFor={id}>
				{resolveString(component.label, dataModel, scope)}
			</FieldLabel>
			{input.errors.length > 0 ? (
				<FieldError id={errorId}>{input.errors.join(" ")}</FieldError>
			) : null}
		</Field>
	);
};
