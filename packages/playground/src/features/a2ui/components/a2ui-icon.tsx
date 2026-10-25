import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2UI_ICONS } from "./a2ui-icons";

/** `Icon`: a catalog icon name drawn as the design system's Lucide icon. An icon the map lacks draws nothing. */
export const A2uiIcon = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const name = resolveString(component.name, dataModel, scope);
	if (!Object.hasOwn(A2UI_ICONS, name)) {
		return null;
	}
	const Icon = A2UI_ICONS[name];
	return <Icon aria-hidden="true" className="size-5 shrink-0" />;
};
