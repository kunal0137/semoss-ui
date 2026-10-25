import { useId } from "react";
import { Input } from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiFieldFrame } from "./a2ui-field-frame";
import { useA2uiInput } from "./use-a2ui-input";

/** The native input for the parts of a date the agent enables, and how much of an ISO value it reads. */
const pickInput = (
	enableDate: boolean,
	enableTime: boolean,
): { type: string; length: number } =>
	enableDate && enableTime
		? { type: "datetime-local", length: 16 }
		: enableTime
			? { type: "time", length: 5 }
			: { type: "date", length: 10 };

/** `DateTimeInput`: the browser's own date, time or date-and-time picker, bound to the data model. */
export const A2uiDateTimeInput = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const input = useA2uiInput(component.value, component.checks, scope);
	const id = useId();
	const errorId = `${id}-error`;
	const { type, length } = pickInput(
		component.enableDate !== false,
		component.enableTime === true,
	);
	const value =
		typeof input.value === "string"
			? type === "time" && input.value.includes("T")
				? input.value.slice(11, 11 + length)
				: input.value.slice(0, length)
			: "";
	return (
		<A2uiFieldFrame
			controlId={id}
			errorId={errorId}
			label={resolveString(component.label, dataModel, scope)}
			errors={input.errors}
		>
			<Input
				id={id}
				type={type}
				value={value}
				min={
					typeof component.min === "string"
						? component.min.slice(0, length)
						: undefined
				}
				max={
					typeof component.max === "string"
						? component.max.slice(0, length)
						: undefined
				}
				disabled={input.isDisabled}
				onBlur={input.touch}
				onChange={(event) => input.setValue(event.target.value)}
				aria-invalid={input.errors.length > 0}
				aria-describedby={input.errors.length > 0 ? errorId : undefined}
			/>
		</A2uiFieldFrame>
	);
};
