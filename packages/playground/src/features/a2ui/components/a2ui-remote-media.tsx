import { ImageOff } from "lucide-react";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiPlaceholder } from "./a2ui-placeholder";

/** The host of a URL, or nothing when it is not one. */
const toHost = (value: string): string => {
	try {
		return new URL(value).host;
	} catch {
		return "";
	}
};

/**
 * `Image`, `Video` and `AudioPlayer`. They do not load. A URL an agent writes
 * is a request the page would send on its behalf, and it can carry what the
 * agent read in its query string; the placeholder names the host instead.
 */
export const A2uiRemoteMedia = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const host = toHost(resolveString(component.url, dataModel, scope));
	const description = resolveString(component.description, dataModel, scope);
	return (
		<A2uiPlaceholder>
			<span className="flex items-center gap-2">
				<ImageOff aria-hidden="true" className="size-4 shrink-0" />
				<span className="min-w-0 break-words">
					{component.component} not loaded
					{host ? ` (${host})` : ""}
					{description ? `: ${description}` : ""}
				</span>
			</span>
		</A2uiPlaceholder>
	);
};
