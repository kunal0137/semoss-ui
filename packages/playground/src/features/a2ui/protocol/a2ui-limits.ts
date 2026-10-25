/** Components one surface may hold; the rest of an update is refused. */
export const MAX_COMPONENTS = 200;

/** How deep components may nest before a placeholder is drawn instead. */
export const MAX_DEPTH = 20;

/** The serialized size of a surface's data model, in characters. */
export const MAX_DATA_MODEL_CHARS = 256 * 1024;

/** Items one template draws from a list. */
export const MAX_TEMPLATE_ITEMS = 200;

/** The longest pattern or value a `regex` check will run. */
export const MAX_REGEX_PATTERN = 200;
export const MAX_REGEX_INPUT = 10_000;
