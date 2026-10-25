import { useId } from "react";
import { Input, Textarea } from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import { matchesPattern } from "../binding/a2ui-functions";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiFieldFrame } from "./a2ui-field-frame";
import { useA2uiInput } from "./use-a2ui-input";

const INPUT_TYPES: Record<string, string> = {
	number: "number",
	obscured: "password",
	shortText: "text",
};

/** Whether text breaks the field's own `validationRegexp`; an empty field never does. */
const breaksPattern = (pattern: unknown, text: string): boolean =>
	typeof pattern === "string" &&
	text !== "" &&
	!matchesPattern(pattern, text);

/** `TextField`: one line, a number, a password or a longer text, bound to the data model. */
export const A2uiTextField = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const input = useA2uiInput(component.value, component.checks, scope);
	const id = useId();
	const errorId = `${id}-error`;
	const label = resolveString(component.label, dataModel, scope);
	const text =
		typeof input.value === "string"
			? input.value
			: input.value == null
				? ""
				: String(input.value);
	const errors = [
		...input.errors,
		...(breaksPattern(component.validationRegexp, text)
			? ["This does not match the expected format."]
			: []),
	];
	const commonProps = {
		id,
		value: text,
		disabled: input.isDisabled,
		onBlur: input.touch,
		"aria-invalid": errors.length > 0,
		"aria-describedby": errors.length > 0 ? errorId : undefined,
	};
	return (
		<A2uiFieldFrame
			controlId={id}
			errorId={errorId}
			label={label}
			errors={errors}
		>
			{component.variant === "longText" ? (
				<Textarea
					{...commonProps}
					onChange={(event) => input.setValue(event.target.value)}
				/>
			) : (
				<Input
					{...commonProps}
					type={
						typeof component.variant === "string" &&
						Object.hasOwn(INPUT_TYPES, component.variant)
							? INPUT_TYPES[component.variant]
							: "text"
					}
					onChange={(event) => input.setValue(event.target.value)}
				/>
			)}
		</A2uiFieldFrame>
	);
};
