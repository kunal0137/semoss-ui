import { Tabs, TabsContent, TabsList, TabsTrigger } from "@semoss/ui/next";
import { isRecord } from "@semoss/utility/object";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveString } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";

/** `Tabs`: a title and a child for each tab. */
export const A2uiTabs = ({
	component,
	scope,
	renderChild,
}: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	// A tab's value is its position: tabs arrive as a list and are never reordered.
	const tabs = (Array.isArray(component.tabs) ? component.tabs : [])
		.filter(isRecord)
		.map((tab, index) => ({ tab, value: String(index) }));
	if (tabs.length === 0) {
		return null;
	}
	return (
		<Tabs defaultValue="0" className="min-w-0">
			<TabsList className="h-auto max-w-full flex-wrap justify-start">
				{tabs.map(({ tab, value }) => (
					<TabsTrigger key={value} value={value}>
						{resolveString(tab.title, dataModel, scope)}
					</TabsTrigger>
				))}
			</TabsList>
			{tabs.map(({ tab, value }) => (
				<TabsContent key={value} value={value} className="min-w-0">
					{renderChild(tab.child)}
				</TabsContent>
			))}
		</Tabs>
	);
};
