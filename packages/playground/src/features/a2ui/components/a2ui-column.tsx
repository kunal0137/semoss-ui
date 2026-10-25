import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { stackClasses } from "./a2ui-stack-classes";

/** `Column`: children one above the other. */
export const A2uiColumn = ({ component, renderChildren }: A2uiAdapterProps) => (
	<div className={stackClasses("column", component.justify, component.align)}>
		{renderChildren(component.children)}
	</div>
);
