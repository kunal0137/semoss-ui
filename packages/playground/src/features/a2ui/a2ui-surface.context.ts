import { createContext, useContext } from "react";
import type { A2uiAction, A2uiSurface } from "./a2ui.types";

/** What components read from the surface they are drawn in. */
export interface A2uiSurfaceContextValue {
	/** The surface: its components by id. */
	surface: A2uiSurface;
	/** The data model as the user has edited it. */
	dataModel: unknown;
	/** Whether a button press can reach the assistant; otherwise the surface is read-only. */
	isInteractive: boolean;
	/** Writes the user's edit into the data model. */
	setValue: (pointer: string, value: unknown) => void;
	/** Sends a button's action. */
	dispatch: (action: A2uiAction) => void;
}

/** The surface a component is drawn in. */
export const A2uiSurfaceContext = createContext<A2uiSurfaceContextValue | null>(
	null,
);

/**
 * The surface the calling component is drawn in.
 *
 * @return The surface's context.
 * @throws When used outside an `A2uiSurfaceContext` provider.
 */
export const useA2uiSurface = (): A2uiSurfaceContextValue => {
	const value = useContext(A2uiSurfaceContext);
	if (!value) {
		throw new Error("useA2uiSurface needs an A2uiSurfaceContext provider");
	}
	return value;
};
