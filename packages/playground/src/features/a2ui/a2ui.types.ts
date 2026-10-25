/** A plain JSON object, the shape of an A2UI component and of a data model branch. */
export type A2uiRecord = Record<string, unknown>;

/** A reference into the surface's data model, such as `{ path: "/user/name" }`. */
export interface A2uiBinding {
	/** A JSON Pointer; one that does not start with `/` is relative to the template item. */
	path: string;
}

/** A call of a catalog function, such as `{ call: "required", args: { value: ... } }`. */
export interface A2uiFunctionCall {
	/** The function's name. */
	call: string;
	/** Its arguments; each is a literal, a binding or a nested call. */
	args?: A2uiRecord;
}

/** One component of a surface. Its other keys are the catalog's properties for `component`. */
export interface A2uiComponent extends A2uiRecord {
	/** Names the component in its surface; `root` is where rendering starts. */
	id: string;
	/** The catalog component to draw, such as `Text` or `Column`. */
	component: string;
}

/** `createSurface`: opens a surface. */
export interface A2uiCreateSurface {
	kind: "createSurface";
	surfaceId: string;
	catalogId: string;
}

/** `updateComponents`: adds or replaces components, by id. */
export interface A2uiUpdateComponents {
	kind: "updateComponents";
	surfaceId: string;
	components: A2uiComponent[];
}

/** `updateDataModel`: sets the value at `path`, or removes it when there is no value. */
export interface A2uiUpdateDataModel {
	kind: "updateDataModel";
	surfaceId: string;
	/** A JSON Pointer; `/` or no path is the whole model. */
	path: string;
	/** What to set; only read when `hasValue` is true. */
	value: unknown;
	/** Whether the message carried a `value`; without one the key at `path` is removed. */
	hasValue: boolean;
}

/** `deleteSurface`: closes a surface. */
export interface A2uiDeleteSurface {
	kind: "deleteSurface";
	surfaceId: string;
}

/** A server-to-client A2UI message, normalized from the wire's one-key envelopes. */
export type A2uiMessage =
	| A2uiCreateSurface
	| A2uiUpdateComponents
	| A2uiUpdateDataModel
	| A2uiDeleteSurface;

/** A surface: its components by id and its data model. */
export interface A2uiSurface {
	id: string;
	catalogId: string;
	components: Readonly<Record<string, A2uiComponent>>;
	dataModel: unknown;
}

/** What the messages built: the surfaces in the order they opened, and why anything was refused. */
export interface A2uiState {
	surfaces: Readonly<Record<string, A2uiSurface>>;
	order: readonly string[];
	/** One line for each message or component that was refused. */
	problems: readonly string[];
}

/** Where a component sits in a template: paths without a leading `/` are read from `base`. */
export interface A2uiScope {
	/** The JSON Pointer of the template item, or `""` outside a template. */
	base: string;
}

/** What a user gesture on a surface sends back. */
export interface A2uiAction {
	/** The action's name, from `action.event.name`. */
	name: string;
	surfaceId: string;
	/** The component the user pressed. */
	sourceComponentId: string;
	/** The action's context, with its bindings read from the data model. */
	context: A2uiRecord;
	/** The surface's whole data model when the user pressed. */
	dataModel: unknown;
}
