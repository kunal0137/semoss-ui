import { Separator } from "@semoss/ui/next";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";

/** `Divider`: a rule, horizontal unless the agent asks for a vertical one. */
export const A2uiDivider = ({ component }: A2uiAdapterProps) => (
	<Separator
		orientation={component.axis === "vertical" ? "vertical" : "horizontal"}
		className={component.axis === "vertical" ? "self-stretch" : undefined}
	/>
);
