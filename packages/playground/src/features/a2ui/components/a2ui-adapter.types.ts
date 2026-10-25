import type { ReactNode } from "react";
import type { A2uiComponent, A2uiScope } from "../a2ui.types";

/** What the renderer hands the adapter that draws one catalog component. */
export interface A2uiAdapterProps {
	/** The component, with its properties as the agent wrote them. */
	component: A2uiComponent;
	/** Where it sits, so a relative path in it reads the right template item. */
	scope: A2uiScope;
	/** Draws the component an id names; draws a placeholder for an id that is not one. */
	renderChild: (id: unknown, scope?: A2uiScope) => ReactNode;
	/** Draws a `children` property: a list of ids, or a template over a list in the data model. */
	renderChildren: (children: unknown) => ReactNode[];
}
