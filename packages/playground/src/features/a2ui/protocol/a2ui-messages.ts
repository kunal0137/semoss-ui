import { tryParseJson } from "@semoss/utility/json";
import { isRecord } from "@semoss/utility/object";
import type { A2uiComponent, A2uiMessage } from "../a2ui.types";

/** The wire versions this renderer reads; `v0.9` and `v0.9.1` share their messages. */
const SUPPORTED_VERSIONS = new Set(["v0.9", "v0.9.1"]);

/** What parsing found. */
export interface A2uiParsed {
	messages: A2uiMessage[];
	/** One line for each envelope that was not a valid message. */
	problems: string[];
}

/** Reads one envelope; returns the message, or why it is not one. */
const parseEnvelope = (
	envelope: unknown,
): { message: A2uiMessage } | { problem: string } => {
	if (envelope === INVALID) {
		return { problem: "it is not valid JSON" };
	}
	if (!isRecord(envelope)) {
		return { problem: "an envelope is not an object" };
	}
	if (
		typeof envelope.version === "string" &&
		!SUPPORTED_VERSIONS.has(envelope.version)
	) {
		return { problem: `version ${envelope.version} is not supported` };
	}
	const { createSurface, updateComponents, updateDataModel, deleteSurface } =
		envelope;

	if (isRecord(createSurface)) {
		if (
			typeof createSurface.surfaceId !== "string" ||
			!createSurface.surfaceId
		) {
			return { problem: "createSurface needs a surfaceId" };
		}
		return {
			message: {
				kind: "createSurface",
				surfaceId: createSurface.surfaceId,
				catalogId:
					typeof createSurface.catalogId === "string"
						? createSurface.catalogId
						: "",
			},
		};
	}
	if (isRecord(updateComponents)) {
		if (typeof updateComponents.surfaceId !== "string") {
			return { problem: "updateComponents needs a surfaceId" };
		}
		if (!Array.isArray(updateComponents.components)) {
			return { problem: "updateComponents needs a components list" };
		}
		return {
			message: {
				kind: "updateComponents",
				surfaceId: updateComponents.surfaceId,
				// Components without an id or a name are left for the reducer to report.
				components: updateComponents.components as A2uiComponent[],
			},
		};
	}
	if (isRecord(updateDataModel)) {
		if (typeof updateDataModel.surfaceId !== "string") {
			return { problem: "updateDataModel needs a surfaceId" };
		}
		return {
			message: {
				kind: "updateDataModel",
				surfaceId: updateDataModel.surfaceId,
				path:
					typeof updateDataModel.path === "string"
						? updateDataModel.path
						: "/",
				value: updateDataModel.value,
				hasValue: Object.hasOwn(updateDataModel, "value"),
			},
		};
	}
	if (isRecord(deleteSurface)) {
		if (typeof deleteSurface.surfaceId !== "string") {
			return { problem: "deleteSurface needs a surfaceId" };
		}
		return {
			message: {
				kind: "deleteSurface",
				surfaceId: deleteSurface.surfaceId,
			},
		};
	}
	return { problem: "an envelope is not an A2UI message" };
};

/** Marks an object that was found but is not valid JSON. */
const INVALID = Symbol("invalid");

/**
 * The top-level `{…}` objects in text, found by counting braces outside
 * strings, so JSON Lines, pretty-printed objects and several objects on a line
 * all read the same. Text between objects is ignored, and so is an object
 * still open at the end, which is what a streaming reply looks like. An
 * object that does not parse comes back as `INVALID`: one bad envelope costs
 * that envelope, not the ones around it.
 */
const STARTS_ENVELOPE = /^\{\s*"version"/;

/** Whether only whitespace sits between the last line break and `index`. */
const isLineStart = (text: string, index: number): boolean =>
	text.slice(text.lastIndexOf("\n", index - 1) + 1, index).trim() === "";

const splitObjects = (text: string): unknown[] => {
	const found: unknown[] = [];
	let depth = 0;
	let start = -1;
	let inString = false;
	let isEscaped = false;
	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (inString) {
			if (isEscaped) {
				isEscaped = false;
			} else if (char === "\\") {
				isEscaped = true;
			} else if (char === '"') {
				inString = false;
			}
		} else if (char === '"') {
			inString = depth > 0;
		} else if (char === "{") {
			// A line that opens a new envelope while one is still open means the open one
			// lost a closing brace: give it up, so one slip does not swallow what follows.
			if (
				depth > 0 &&
				STARTS_ENVELOPE.test(text.slice(index)) &&
				isLineStart(text, index)
			) {
				found.push(INVALID);
				depth = 0;
			}
			if (depth === 0) {
				start = index;
			}
			depth++;
		} else if (char === "}" && depth > 0) {
			depth--;
			if (depth === 0) {
				const parsed = tryParseJson(text.slice(start, index + 1));
				found.push(parsed === undefined ? INVALID : parsed);
			}
		}
	}
	return found;
};

/**
 * Finds the envelopes in what a model produced: an array, an object holding
 * one under `envelopes` or `messages`, a single envelope, or text of objects
 * (JSON Lines, or the same pretty-printed).
 */
const toEnvelopes = (input: unknown): unknown[] | null => {
	if (typeof input === "string") {
		const whole = tryParseJson(input.trim());
		if (whole !== undefined) {
			return toEnvelopes(whole);
		}
		const objects = splitObjects(input);
		return objects.length > 0 ? objects : null;
	}
	if (Array.isArray(input)) {
		return input;
	}
	if (isRecord(input)) {
		for (const key of ["envelopes", "messages"]) {
			const inner = input[key];
			if (typeof inner === "string" || Array.isArray(inner)) {
				return toEnvelopes(inner);
			}
		}
		return [input];
	}
	return null;
};

/**
 * Reads A2UI messages out of what a tool call carried. It never throws: what
 * it cannot read comes back as problems, so a bad envelope costs the surface
 * its update and never the transcript.
 *
 * @param input - An array of envelopes, an object with `envelopes`, one envelope, or JSON Lines text.
 * @return The messages in order, and a line for each envelope refused.
 */
export const parseA2uiMessages = (input: unknown): A2uiParsed => {
	const envelopes = toEnvelopes(input);
	if (!envelopes) {
		return { messages: [], problems: ["no A2UI envelopes were found"] };
	}
	const messages: A2uiMessage[] = [];
	const problems: string[] = [];
	envelopes.forEach((envelope, index) => {
		const parsed = parseEnvelope(envelope);
		if ("message" in parsed) {
			messages.push(parsed.message);
		} else {
			problems.push(`envelope ${index + 1}: ${parsed.problem}`);
		}
	});
	return { messages, problems };
};
