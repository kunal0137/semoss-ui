import type { A2uiState } from "../a2ui.types";
import { parseA2uiMessages } from "./a2ui-messages";
import { reduceA2uiMessages } from "./a2ui-reducer";

/**
 * The surfaces some text builds, and every line of why a part of it was refused.
 *
 * @param source - Envelopes as text: a JSON array, or JSON Lines.
 * @return The surfaces and their problems.
 */
export const buildA2uiState = (source: string): A2uiState => {
	const parsed = parseA2uiMessages(source);
	const reduced = reduceA2uiMessages(parsed.messages);
	return { ...reduced, problems: [...parsed.problems, ...reduced.problems] };
};

/**
 * What of some text is whole while it is still being written: without its
 * last line unless that line is finished. A line of JSON Lines parses on its
 * own, so a surface paints message by message as it streams.
 *
 * @param text - The text so far.
 * @return The text up to its last line break, or all of it if it ends in one.
 */
export const wholeLines = (text: string): string =>
	text.endsWith("\n") ? text : text.slice(0, text.lastIndexOf("\n") + 1);

const OPEN_TAG = /<a2ui-json>\s*/g;
const CLOSE_TAG = /\s*<\/a2ui-json>/g;

/**
 * The official A2UI agent SDK has the model wrap its messages in
 * `<a2ui-json>…</a2ui-json>`. Markdown would mangle JSON written that way, so
 * the tags become the ```` ```a2ui ```` fence this app draws. A tag still open
 * (the reply is streaming) becomes a fence still open.
 *
 * @param text - Assistant text.
 * @return The text with each tag pair as a fenced block.
 */
export const fenceA2uiTags = (text: string): string =>
	text.includes("<a2ui-json>")
		? text.replace(OPEN_TAG, "\n```a2ui\n").replace(CLOSE_TAG, "\n```\n")
		: text;
