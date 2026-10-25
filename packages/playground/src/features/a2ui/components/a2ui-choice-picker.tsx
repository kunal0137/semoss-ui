import { useId } from "react";
import {
	Checkbox,
	Field,
	FieldLabel,
	FieldLegend,
	FieldSet,
	RadioGroup,
	RadioGroupItem,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@semoss/ui/next";
import { isRecord } from "@semoss/utility/object";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { useA2uiInput } from "./use-a2ui-input";

/** More single-choice options than this draw a menu instead of a radio group. */
const MAX_RADIO_OPTIONS = 6;

/**
 * `ChoicePicker`: one option or several. Its value is always a list of option
 * values, as the catalog says, even when only one can be chosen.
 */
export const A2uiChoicePicker = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const input = useA2uiInput(component.value, component.checks, scope);
	const id = useId();
	const options = (
		Array.isArray(component.options) ? component.options : []
	).flatMap((option): { label: string; value: string }[] =>
		isRecord(option) && typeof option.value === "string"
			? [
					{
						label:
							resolveString(option.label, dataModel, scope) ||
							option.value,
						value: option.value,
					},
				]
			: [],
	);
	const selected = Array.isArray(input.value)
		? input.value.filter(
				(value): value is string => typeof value === "string",
			)
		: [];
	const label = resolveString(component.label, dataModel, scope);
	const isMultiple = component.variant === "multipleSelection";

	return (
		<FieldSet className="min-w-0" disabled={input.isDisabled}>
			{label ? <FieldLegend variant="label">{label}</FieldLegend> : null}
			{isMultiple ? (
				options.map((option) => {
					const optionId = `${id}-${option.value}`;
					return (
						<Field key={option.value} orientation="horizontal">
							<Checkbox
								id={optionId}
								checked={selected.includes(option.value)}
								onCheckedChange={(checked) =>
									input.setValue(
										checked === true
											? [...selected, option.value]
											: selected.filter(
													(value) =>
														value !== option.value,
												),
									)
								}
							/>
							<FieldLabel htmlFor={optionId}>
								{option.label}
							</FieldLabel>
						</Field>
					);
				})
			) : options.length > MAX_RADIO_OPTIONS ? (
				<Select
					value={selected[0] ?? ""}
					onValueChange={(value) => input.setValue([value])}
				>
					<SelectTrigger
						id={id}
						aria-label={label || undefined}
						className="w-full"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : (
				<RadioGroup
					value={selected[0] ?? ""}
					onValueChange={(value) => input.setValue([value])}
				>
					{options.map((option) => {
						const optionId = `${id}-${option.value}`;
						return (
							<Field key={option.value} orientation="horizontal">
								<RadioGroupItem
									id={optionId}
									value={option.value}
								/>
								<FieldLabel htmlFor={optionId}>
									{option.label}
								</FieldLabel>
							</Field>
						);
					})}
				</RadioGroup>
			)}
		</FieldSet>
	);
};
