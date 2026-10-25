import { lazy, Suspense, useMemo, useState } from "react";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveValue } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiPlaceholder } from "./a2ui-placeholder";

// Vega is large and most answers hold no chart, so it loads on the first one.
const VegaLite = lazy(() =>
	import("react-vega").then((m) => ({ default: m.VegaLite })),
);

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * `Chart` (an extension to the basic catalog): a Vega-Lite spec drawn with the
 * builder's `react-vega` block. `spec` is the chart without its data, `data` is
 * a binding to the rows in the data model. The spec may not fetch: a `url`
 * anywhere in it is refused, so the agent cannot make the browser load a page.
 */
export const A2uiChart = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const [error, setError] = useState<string | null>(null);
	const rows = resolveValue(component.data, dataModel, scope);
	const spec = useMemo(() => {
		const { spec } = component;
		if (!isObject(spec) || JSON.stringify(spec).includes('"url"')) {
			return null;
		}
		return {
			width: "container",
			height: 260,
			...spec,
			data: { values: Array.isArray(rows) ? rows : [] },
		};
	}, [component, rows]);

	if (!spec) {
		return <A2uiPlaceholder>Chart: no usable spec.</A2uiPlaceholder>;
	}
	if (error) {
		return <A2uiPlaceholder>Chart: {error}</A2uiPlaceholder>;
	}
	return (
		<div className="w-full min-w-0 [&_.vega-embed]:w-full">
			<Suspense
				fallback={<A2uiPlaceholder>Loading chart…</A2uiPlaceholder>}
			>
				<VegaLite
					// biome-ignore lint/suspicious/noExplicitAny: an agent-written spec is validated by Vega-Lite itself
					spec={spec as any}
					actions={false}
					onError={(e) =>
						setError(String(e.message ?? e).slice(0, 120))
					}
				/>
			</Suspense>
		</div>
	);
};
