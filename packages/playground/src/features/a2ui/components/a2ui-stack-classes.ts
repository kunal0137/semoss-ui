import { cn } from "@semoss/ui/next";

const JUSTIFY: Record<string, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	spaceBetween: "justify-between",
	spaceAround: "justify-around",
	spaceEvenly: "justify-evenly",
	stretch: "",
};

const ALIGN: Record<string, string> = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
};

const pick = (table: Record<string, string>, key: unknown): string =>
	typeof key === "string" && Object.hasOwn(table, key) ? table[key] : "";

/**
 * Classes for a flex container from an agent's `justify` and `align`.
 *
 * @param direction - `row` wraps, so a row of fields stacks on a narrow screen; `column` does not.
 * @param justify - The main axis.
 * @param align - The cross axis.
 * @return The container's classes.
 */
export const stackClasses = (
	direction: "row" | "column",
	justify: unknown,
	align: unknown,
): string =>
	cn(
		"flex min-w-0 gap-3",
		direction === "row" ? "flex-row flex-wrap" : "flex-col",
		pick(JUSTIFY, justify),
		pick(ALIGN, align),
	);
