import { isRecord } from "@semoss/utility/object";
import type {
	A2uiComponent,
	A2uiMessage,
	A2uiState,
	A2uiSurface,
} from "../a2ui.types";
import { MAX_COMPONENTS, MAX_DATA_MODEL_CHARS } from "./a2ui-limits";
import { writePointer } from "./a2ui-pointer";

/** The state before any message. */
export const EMPTY_A2UI_STATE: A2uiState = {
	surfaces: {},
	order: [],
	problems: [],
};

const isComponent = (value: unknown): value is A2uiComponent =>
	isRecord(value) &&
	typeof value.id === "string" &&
	value.id !== "" &&
	typeof value.component === "string";

const withProblem = (state: A2uiState, problem: string): A2uiState => ({
	...state,
	problems: [...state.problems, problem],
});

const withSurface = (state: A2uiState, surface: A2uiSurface): A2uiState => ({
	...state,
	surfaces: { ...state.surfaces, [surface.id]: surface },
});

/**
 * Applies one message. It is pure and never throws: a message it refuses
 * leaves the surfaces as they were and adds a line to `problems`.
 *
 * @param state - The surfaces so far.
 * @param message - The next message.
 * @return The surfaces after it.
 */
export const applyA2uiMessage = (
	state: A2uiState,
	message: A2uiMessage,
): A2uiState => {
	if (message.kind === "createSurface") {
		if (state.surfaces[message.surfaceId]) {
			return withProblem(
				state,
				`surface ${message.surfaceId} already exists; delete it before creating it again`,
			);
		}
		return {
			...withSurface(state, {
				id: message.surfaceId,
				catalogId: message.catalogId,
				components: {},
				dataModel: {},
			}),
			order: [...state.order, message.surfaceId],
		};
	}

	const surface = state.surfaces[message.surfaceId];
	if (!surface) {
		return withProblem(
			state,
			`${message.kind} names surface ${message.surfaceId}, which was never created`,
		);
	}

	if (message.kind === "deleteSurface") {
		const { [message.surfaceId]: _deleted, ...rest } = state.surfaces;
		return {
			...state,
			surfaces: rest,
			order: state.order.filter((id) => id !== message.surfaceId),
		};
	}

	if (message.kind === "updateComponents") {
		const components = { ...surface.components };
		let next = state;
		for (const component of message.components) {
			if (!isComponent(component)) {
				next = withProblem(
					next,
					`a component of ${surface.id} has no id or no component name`,
				);
				continue;
			}
			if (
				!Object.hasOwn(components, component.id) &&
				Object.keys(components).length >= MAX_COMPONENTS
			) {
				next = withProblem(
					next,
					`surface ${surface.id} is limited to ${MAX_COMPONENTS} components`,
				);
				break;
			}
			components[component.id] = component;
		}
		return withSurface(next, { ...surface, components });
	}

	const dataModel = writePointer(
		surface.dataModel,
		message.path,
		message.value,
		!message.hasValue,
	);
	if (JSON.stringify(dataModel ?? null).length > MAX_DATA_MODEL_CHARS) {
		return withProblem(
			state,
			`the data model of ${surface.id} is limited to ${MAX_DATA_MODEL_CHARS / 1024} KB`,
		);
	}
	return withSurface(state, { ...surface, dataModel });
};

/**
 * Applies messages in order.
 *
 * @param messages - The messages a tool call carried.
 * @param state - Where to start.
 * @return The surfaces after all of them.
 */
export const reduceA2uiMessages = (
	messages: readonly A2uiMessage[],
	state: A2uiState = EMPTY_A2UI_STATE,
): A2uiState => messages.reduce(applyA2uiMessage, state);
