import { type ReactNode, useMemo, useState } from "react";
import { Muted, toast } from "@semoss/ui/next";
import { getErrorMessage } from "@semoss/utility/error";
import type { RoomStore } from "@/stores";
import type { A2uiAction } from "./a2ui.types";
import { toActionMessage } from "./a2ui-action-message";
import { A2uiSurfaceView } from "./a2ui-surface-view";
import { A2uiPlaceholder } from "./components/a2ui-placeholder";
import { buildA2uiState, wholeLines } from "./protocol/a2ui-state";

/** Props for {@link A2uiBlock}. */
export interface A2uiBlockProps {
	/** The fenced block's text: A2UI envelopes as JSON Lines or a JSON array. */
	code: string;
	/** Whether the message is still being written. */
	isLoading?: boolean;
	/** The room a press is sent to; without one the surface is read-only. */
	room?: RoomStore;
	/** Drawn when nothing in the block can be read, so it degrades to the code it was. */
	fallback: ReactNode;
}

/**
 * An answer painted as a surface: an ```` ```a2ui ```` block in the assistant's
 * text, next to ```` ```mermaid ````. It is not a tool call, so there is no
 * approval to wait for; a button press is sent as the user's next message. While
 * the message streams the surface paints from the lines that are whole, and
 * stays read-only.
 */
export const A2uiBlock = ({
	code,
	isLoading,
	room,
	fallback,
}: A2uiBlockProps) => {
	const [isSent, setIsSent] = useState(false);
	const source = isLoading ? wholeLines(code) : code;
	const state = useMemo(() => buildA2uiState(source), [source]);
	const surfaces = state.order.map((id) => state.surfaces[id]);

	if (surfaces.length === 0) {
		return isLoading ? (
			<A2uiPlaceholder>Painting the view…</A2uiPlaceholder>
		) : (
			fallback
		);
	}

	const handleAction = (action: A2uiAction) => {
		if (!room) {
			return;
		}
		setIsSent(true);
		room.askMessage(toActionMessage(action)).catch((error: unknown) => {
			setIsSent(false);
			toast.error(getErrorMessage(error, "Could not send your answers."));
		});
	};

	return (
		<div className="my-2 flex min-w-0 flex-col gap-2">
			{surfaces.map((surface) => (
				<A2uiSurfaceView
					// A change to the text restarts the edits, which no longer match.
					key={`${surface.id}:${source}`}
					surface={surface}
					isInteractive={!!room && !isLoading && !isSent}
					onAction={handleAction}
				/>
			))}
			{isSent ? <Muted className="text-xs">Answers sent.</Muted> : null}
		</div>
	);
};
