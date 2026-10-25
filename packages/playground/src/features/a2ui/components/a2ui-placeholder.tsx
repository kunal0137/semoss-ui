import type { ReactNode } from "react";

/** Props for {@link A2uiPlaceholder}. */
export interface A2uiPlaceholderProps {
	/** What could not be drawn, and why. */
	children: ReactNode;
}

/** Stands in for a component that cannot be drawn, so one bad node never blanks the surface. */
export const A2uiPlaceholder = ({ children }: A2uiPlaceholderProps) => (
	<div className="min-w-0 rounded-md border border-border border-dashed bg-muted px-2 py-1 text-muted-foreground text-xs">
		{children}
	</div>
);
