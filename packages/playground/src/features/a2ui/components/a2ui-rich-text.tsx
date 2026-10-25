import type { ReactNode } from "react";
import { InlineCode } from "@semoss/ui/next";

const LIST_ITEM = /^\s*[-*]\s+/;
const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g;

/** Splits one line into text, bold, italic and code. Links and images stay as text. */
const toInline = (line: string, keyPrefix: string): ReactNode[] =>
	line.split(INLINE).map((part, index) => {
		const key = `${keyPrefix}-${index}`;
		if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
			return <strong key={key}>{part.slice(2, -2)}</strong>;
		}
		if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
			return <InlineCode key={key}>{part.slice(1, -1)}</InlineCode>;
		}
		if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
			return <em key={key}>{part.slice(1, -1)}</em>;
		}
		return part;
	});

/** Props for {@link A2uiRichText}. */
export interface A2uiRichTextProps {
	/** Text an agent wrote: paragraphs, `-` lists, `**bold**`, `*italic*` and `` `code` ``. */
	text: string;
}

/**
 * A model's text, drawn as text nodes only. It is not `Markdown`, which turns
 * on raw HTML: the A2UI catalog says its text has no HTML, images or links, so
 * anything else a model writes stays visible characters.
 */
export const A2uiRichText = ({ text }: A2uiRichTextProps) => {
	// Blocks and lines come from the text and are never reordered, so a position is their identity.
	const blocks = text
		.replace(/^#{1,6}\s+/gm, "")
		.split(/\n{2,}/)
		.map((block, blockIndex) => ({
			key: `b${blockIndex}`,
			lines: block.split("\n").map((line, lineIndex) => ({
				key: `b${blockIndex}-l${lineIndex}`,
				text: line,
			})),
		}));
	return (
		<>
			{blocks.map(({ key, lines }) => {
				const isList = lines.every((line) => LIST_ITEM.test(line.text));
				return isList ? (
					<ul key={key} className="ms-4 list-disc">
						{lines.map((line) => (
							<li key={line.key}>
								{toInline(
									line.text.replace(LIST_ITEM, ""),
									line.key,
								)}
							</li>
						))}
					</ul>
				) : (
					<span
						key={key}
						className="block whitespace-pre-wrap break-words"
					>
						{toInline(
							lines.map((line) => line.text).join("\n"),
							key,
						)}
					</span>
				);
			})}
		</>
	);
};
