import type { A2uiAction } from "./a2ui.types";

const toText = (value: unknown): string =>
	typeof value === "string" ? value : JSON.stringify(value);

/**
 * What a button press says in the chat: the action and what the user entered, as
 * lines a person reads and the model can answer. A reply has no pending call to
 * resolve, so the press is sent as the user's next message.
 *
 * @param action - The press.
 * @return The message text.
 */
export const toActionMessage = (action: A2uiAction): string => {
	const entries = Object.entries(action.context);
	const answers = entries.length > 0 ? action.context : action.dataModel;
	const lines = Object.entries(
		answers && typeof answers === "object" ? answers : {},
	).map(([key, value]) => `- ${key}: ${toText(value)}`);
	return [`I pressed "${action.name}".`, ...lines].join("\n");
};
