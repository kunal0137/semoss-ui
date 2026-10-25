import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { stackClasses } from "./a2ui-stack-classes";

/** `Row`: children side by side, wrapping when there is no room. */
export const A2uiRow = ({ component, renderChildren }: A2uiAdapterProps) => (
	<div className={stackClasses("row", component.justify, component.align)}>
		{renderChildren(component.children)}
	</div>
);
