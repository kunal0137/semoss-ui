import { useId } from "react";
import { Field, FieldLabel, Slider } from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { useA2uiInput } from "./use-a2ui-input";

/** `Slider`: a number between `min` and `max`, bound to the data model. */
export const A2uiSlider = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const input = useA2uiInput(component.value, component.checks, scope);
	const id = useId();
	const min = typeof component.min === "number" ? component.min : 0;
	const max = typeof component.max === "number" ? component.max : 100;
	const current =
		typeof input.value === "number" && Number.isFinite(input.value)
			? Math.min(Math.max(input.value, min), max)
			: min;
	const label = resolveString(component.label, dataModel, scope);
	return (
		<Field className="min-w-0">
			<FieldLabel htmlFor={id} className="justify-between">
				<span>{label}</span>
				<span className="text-muted-foreground">{current}</span>
			</FieldLabel>
			<Slider
				id={id}
				min={min}
				max={max}
				value={[current]}
				disabled={input.isDisabled}
				onValueChange={([next]) => input.setValue(next)}
				aria-label={label || undefined}
			/>
		</Field>
	);
};
