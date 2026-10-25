import { isRecord } from "@semoss/utility/object";

/** Keys that would reach the prototype; a pointer through one reads nothing and writes nothing. */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Splits a JSON Pointer (RFC 6901) into its keys.
 *
 * @param pointer - A pointer such as `/user/emails/0`; `""` and `/` are the root.
 * @return The keys, or `null` for a pointer that passes through a forbidden key.
 */
export const parsePointer = (pointer: string): string[] | null => {
	if (pointer === "" || pointer === "/") {
		return [];
	}
	const keys = pointer
		.replace(/^\//, "")
		.split("/")
		.map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));
	return keys.some((key) => FORBIDDEN_KEYS.has(key)) ? null : keys;
};

/**
 * Reads the value a pointer names.
 *
 * @param root - The data model.
 * @param pointer - Where to read.
 * @return The value, or `undefined` when nothing is there.
 */
export const readPointer = (root: unknown, pointer: string): unknown => {
	const keys = parsePointer(pointer);
	if (!keys) {
		return undefined;
	}
	let current = root;
	for (const key of keys) {
		if (Array.isArray(current)) {
			current = /^\d+$/.test(key) ? current[Number(key)] : undefined;
		} else if (isRecord(current) && Object.hasOwn(current, key)) {
			current = current[key];
		} else {
			return undefined;
		}
	}
	return current;
};

/** The largest array index a pointer may create, so one write cannot allocate a huge sparse array. */
const MAX_WRITE_INDEX = 10_000;

/**
 * Sets, or removes, the value a pointer names, without changing `root`.
 * A missing branch is created: an array when the next key is a number,
 * an object otherwise.
 *
 * @param root - The data model.
 * @param pointer - Where to write; `/` replaces the whole model.
 * @param value - What to write.
 * @param remove - Remove the key instead of setting it.
 * @return The new data model; `root` itself when the pointer is refused.
 */
export const writePointer = (
	root: unknown,
	pointer: string,
	value: unknown,
	remove = false,
): unknown => {
	const keys = parsePointer(pointer);
	if (!keys) {
		return root;
	}
	if (keys.length === 0) {
		return remove ? undefined : value;
	}
	const write = (current: unknown, depth: number): unknown => {
		const key = keys[depth];
		const isLast = depth === keys.length - 1;
		const isIndex = /^\d+$/.test(key);
		if (Array.isArray(current) || (!isRecord(current) && isIndex)) {
			const copy = Array.isArray(current) ? [...current] : [];
			if (!isIndex || Number(key) > MAX_WRITE_INDEX) {
				return current;
			}
			const index = Number(key);
			if (isLast && remove) {
				copy.splice(index, 1);
			} else {
				copy[index] = isLast ? value : write(copy[index], depth + 1);
			}
			return copy;
		}
		const base = isRecord(current) ? current : {};
		if (isLast && remove) {
			const { [key]: _removed, ...rest } = base;
			return rest;
		}
		return {
			...base,
			[key]: isLast
				? value
				: write(
						Object.hasOwn(base, key) ? base[key] : undefined,
						depth + 1,
					),
		};
	};
	return write(root, 0);
};
