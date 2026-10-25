import { cn } from "@semoss/ui/next";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { stackClasses } from "./a2ui-stack-classes";

/** `List`: children in a row that scrolls or a column, which is where a template over data usually lands. */
export const A2uiList = ({ component, renderChildren }: A2uiAdapterProps) => {
	const isHorizontal = component.direction === "horizontal";
	return (
		<div
			className={cn(
				stackClasses(
					isHorizontal ? "row" : "column",
					undefined,
					component.align,
				),
				isHorizontal && "flex-nowrap overflow-x-auto",
			)}
		>
			{renderChildren(component.children)}
		</div>
	);
};
