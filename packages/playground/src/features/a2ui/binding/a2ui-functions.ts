import { isRecord } from "@semoss/utility/object";
import type { A2uiFunctionCall } from "../a2ui.types";
import { MAX_REGEX_INPUT, MAX_REGEX_PATTERN } from "../protocol/a2ui-limits";

/** Reads a value the way a function's argument names it: a literal, a binding or a nested call. */
export type A2uiResolve = (value: unknown) => unknown;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toText = (value: unknown): string =>
	value === undefined || value === null ? "" : String(value);

const toNumber = (value: unknown): number | undefined => {
	if (typeof value === "string" && value.trim() === "") {
		return undefined;
	}
	const number = typeof value === "number" ? value : Number(value);
	return Number.isFinite(number) ? number : undefined;
};

const inRange = (value: number, min: unknown, max: unknown): boolean => {
	const low = toNumber(min);
	const high = toNumber(max);
	return (
		(low === undefined || value >= low) &&
		(high === undefined || value <= high)
	);
};

/**
 * A pattern a model wrote, run against what a user typed. Both are capped:
 * a pattern cannot be proven safe, so it only ever sees a bounded input.
 */
export const matchesPattern = (pattern: string, text: string): boolean => {
	if (pattern.length > MAX_REGEX_PATTERN || text.length > MAX_REGEX_INPUT) {
		return false;
	}
	try {
		return new RegExp(pattern).test(text);
	} catch {
		return false;
	}
};

/** The catalog functions this renderer runs; a call to any other reads as `undefined`. */
const FUNCTIONS: Record<
	string,
	(args: Record<string, unknown>, resolve: A2uiResolve) => unknown
> = {
	required: ({ value }) => {
		if (Array.isArray(value)) {
			return value.length > 0;
		}
		return (
			value !== undefined && value !== null && toText(value).trim() !== ""
		);
	},
	regex: ({ value, pattern }) =>
		typeof pattern === "string" && matchesPattern(pattern, toText(value)),
	length: ({ value, min, max }) => inRange(toText(value).length, min, max),
	numeric: ({ value, min, max }) => {
		const number = toNumber(value);
		return number !== undefined && inRange(number, min, max);
	},
	email: ({ value }) => EMAIL.test(toText(value)),
	and: ({ values }) => Array.isArray(values) && values.every(Boolean),
	or: ({ values }) => Array.isArray(values) && values.some(Boolean),
	not: ({ value }) => !value,
	formatString: ({ value }, resolve) =>
		toText(value).replace(/\$\{([^}]+)\}/g, (_, expression: string) =>
			toText(resolve({ path: expression.trim() })),
		),
	formatNumber: ({ value, decimals, grouping }) => {
		const number = toNumber(value);
		if (number === undefined) {
			return "";
		}
		const digits = toNumber(decimals);
		return new Intl.NumberFormat(undefined, {
			useGrouping: grouping !== false,
			...(digits === undefined
				? {}
				: {
						minimumFractionDigits: digits,
						maximumFractionDigits: digits,
					}),
		}).format(number);
	},
	formatCurrency: ({ value, currency, decimals, grouping }) => {
		const number = toNumber(value);
		if (number === undefined || !/^[A-Za-z]{3}$/.test(toText(currency))) {
			return "";
		}
		const digits = toNumber(decimals);
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: toText(currency).toUpperCase(),
			useGrouping: grouping !== false,
			...(digits === undefined
				? {}
				: {
						minimumFractionDigits: digits,
						maximumFractionDigits: digits,
					}),
		}).format(number);
	},
	pluralize: ({ value, ...forms }) => {
		const number = toNumber(value);
		if (number === undefined) {
			return "";
		}
		const category =
			number === 0 && forms.zero !== undefined
				? "zero"
				: new Intl.PluralRules().select(number);
		return toText(forms[category] ?? forms.other);
	},
};

/**
 * Runs a catalog function. Arguments are read first, so a nested call or a
 * binding gets its value before the function sees it. `openUrl` is not here:
 * it navigates, so it runs only from a click (see the button).
 *
 * @param call - The call.
 * @param resolve - Reads one argument.
 * @return The function's value, or `undefined` for a function this renderer lacks.
 */
export const callA2uiFunction = (
	call: A2uiFunctionCall,
	resolve: A2uiResolve,
): unknown => {
	if (!Object.hasOwn(FUNCTIONS, call.call)) {
		return undefined;
	}
	const args: Record<string, unknown> = {};
	if (isRecord(call.args)) {
		for (const [name, value] of Object.entries(call.args)) {
			args[name] = Array.isArray(value)
				? value.map(resolve)
				: resolve(value);
		}
	}
	return FUNCTIONS[call.call](args, resolve);
};
