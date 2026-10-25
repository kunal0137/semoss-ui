import type { ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@semoss/ui/next";

/** Props for {@link A2uiFieldFrame}. */
export interface A2uiFieldFrameProps {
	/** The control's id, which the label points at. */
	controlId: string;
	/** The id the errors carry, so the control can name them in `aria-describedby`. */
	errorId: string;
	/** The visible label; none draws no label. */
	label: string;
	/** Messages of the checks that fail. */
	errors: string[];
	/** The control. */
	children: ReactNode;
}

/** A labelled control with its failing checks beneath it. */
export const A2uiFieldFrame = ({
	controlId,
	errorId,
	label,
	errors,
	children,
}: A2uiFieldFrameProps) => (
	<Field className="min-w-0">
		{label ? <FieldLabel htmlFor={controlId}>{label}</FieldLabel> : null}
		{children}
		{errors.length > 0 ? (
			<FieldError id={errorId}>{errors.join(" ")}</FieldError>
		) : null}
	</Field>
);
