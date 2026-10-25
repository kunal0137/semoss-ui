import { useCallback, useMemo, useState } from "react";
import type { A2uiAction, A2uiSurface } from "./a2ui.types";
import { A2uiNode } from "./a2ui-node";
import { A2uiSurfaceContext } from "./a2ui-surface.context";
import { ROOT_SCOPE } from "./binding/a2ui-binding";
import { A2uiPlaceholder } from "./components/a2ui-placeholder";
import { writePointer } from "./protocol/a2ui-pointer";

/** Props for {@link A2uiSurfaceView}. */
export interface A2uiSurfaceViewProps {
	/** The surface as the messages built it. */
	surface: A2uiSurface;
	/** Whether a button press can reach the assistant. */
	isInteractive: boolean;
	/** Called with the action a press sends. */
	onAction: (action: A2uiAction) => void;
}

/**
 * One surface, drawn from its `root` component. The data model the user edits
 * is held here, so a form's answers are read by its buttons; messages that
 * change the surface remount it through its `key`, which restarts the edits.
 */
export const A2uiSurfaceView = ({
	surface,
	isInteractive,
	onAction,
}: A2uiSurfaceViewProps) => {
	const [dataModel, setDataModel] = useState<unknown>(surface.dataModel);
	const setValue = useCallback((pointer: string, value: unknown) => {
		setDataModel((current: unknown) =>
			writePointer(current, pointer, value),
		);
	}, []);
	const context = useMemo(
		() => ({
			surface,
			dataModel,
			isInteractive,
			setValue,
			dispatch: onAction,
		}),
		[surface, dataModel, isInteractive, setValue, onAction],
	);
	if (!Object.hasOwn(surface.components, "root")) {
		return (
			<A2uiPlaceholder>
				Surface "{surface.id}" has no root component yet.
			</A2uiPlaceholder>
		);
	}
	return (
		<A2uiSurfaceContext.Provider value={context}>
			{/* A fenced block renders inside the markdown <pre>; reset its mono face and wrapping. */}
			<div
				className="min-w-0 whitespace-normal font-sans"
				data-testid="a2ui-surface-view-surface"
			>
				<A2uiNode
					componentId="root"
					scope={ROOT_SCOPE}
					depth={0}
					ancestors={[]}
				/>
			</div>
		</A2uiSurfaceContext.Provider>
	);
};
