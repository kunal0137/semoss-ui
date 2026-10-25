import { H4, Large, Muted, Small } from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiRichText } from "./a2ui-rich-text";

/** `Text`: the agent's words in the design system's type scale, never as HTML. */
export const A2uiText = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const text = resolveString(component.text, dataModel, scope);
	const content = <A2uiRichText text={text} />;
	switch (component.variant) {
		case "h1":
		case "h2":
			return <H4 className="min-w-0 text-lg">{content}</H4>;
		case "h3":
		case "h4":
			return <Large className="min-w-0">{content}</Large>;
		case "h5":
			return <Small className="min-w-0">{content}</Small>;
		case "caption":
			return <Muted className="block min-w-0 text-xs">{content}</Muted>;
		default:
			// A div, not `P`: body text may hold a list, which a paragraph cannot.
			return (
				<Large className="min-w-0 font-normal text-base">
					{content}
				</Large>
			);
	}
};
