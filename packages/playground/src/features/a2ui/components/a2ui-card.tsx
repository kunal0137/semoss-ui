import { Card, CardContent } from "@semoss/ui/next";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";

/** `Card`: one child inside a framed surface. */
export const A2uiCard = ({ component, renderChild }: A2uiAdapterProps) => (
	<Card className="min-w-0 gap-0 py-0">
		<CardContent className="min-w-0 p-4">
			{renderChild(component.child)}
		</CardContent>
	</Card>
);
