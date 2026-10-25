import type { ReactNode } from "react";
import { isRecord } from "@semoss/utility/object";
import type { A2uiScope } from "./a2ui.types";
import { useA2uiSurface } from "./a2ui-surface.context";
import { toAbsolutePath } from "./binding/a2ui-binding";
import { A2UI_CATALOG } from "./components/a2ui-catalog";
import { A2uiPlaceholder } from "./components/a2ui-placeholder";
import { MAX_DEPTH, MAX_TEMPLATE_ITEMS } from "./protocol/a2ui-limits";
import { readPointer } from "./protocol/a2ui-pointer";

/** Props for {@link A2uiNode}. */
export interface A2uiNodeProps {
	/** The component's id in its surface. */
	componentId: string;
	/** Where it sits. */
	scope: A2uiScope;
	/** How many components are above it. */
	depth: number;
	/** The ids above it, so a component that contains itself is caught. */
	ancestors: readonly string[];
}

/**
 * One component of a surface, drawn by the catalog adapter its `component`
 * names. A missing id, an id that contains itself, a component nested past
 * the depth limit and a component the catalog lacks each draw a placeholder:
 * the rest of the surface still draws.
 */
export const A2uiNode = ({
	componentId,
	scope,
	depth,
	ancestors,
}: A2uiNodeProps) => {
	const { surface, dataModel } = useA2uiSurface();
	if (depth > MAX_DEPTH) {
		return <A2uiPlaceholder>Nested too deeply to show.</A2uiPlaceholder>;
	}
	if (ancestors.includes(componentId)) {
		return (
			<A2uiPlaceholder>
				A component cannot contain itself.
			</A2uiPlaceholder>
		);
	}
	const component = Object.hasOwn(surface.components, componentId)
		? surface.components[componentId]
		: undefined;
	if (!component) {
		return (
			<A2uiPlaceholder>
				Missing component "{componentId}".
			</A2uiPlaceholder>
		);
	}
	if (!Object.hasOwn(A2UI_CATALOG, component.component)) {
		return (
			<A2uiPlaceholder>
				Unsupported component: {component.component}
			</A2uiPlaceholder>
		);
	}
	const Adapter = A2UI_CATALOG[component.component];
	const below = [...ancestors, componentId];

	const renderChild = (
		childId: unknown,
		childScope: A2uiScope = scope,
		key?: string,
	): ReactNode =>
		typeof childId === "string" ? (
			<A2uiNode
				key={key ?? childId}
				componentId={childId}
				scope={childScope}
				depth={depth + 1}
				ancestors={below}
			/>
		) : (
			<A2uiPlaceholder key={key}>A child id is missing.</A2uiPlaceholder>
		);

	const renderChildren = (children: unknown): ReactNode[] => {
		if (Array.isArray(children)) {
			return children
				.slice(0, MAX_TEMPLATE_ITEMS)
				.map((childId, index) =>
					renderChild(childId, scope, `${index}:${String(childId)}`),
				);
		}
		if (
			isRecord(children) &&
			typeof children.componentId === "string" &&
			typeof children.path === "string"
		) {
			const listPath = toAbsolutePath(children.path, scope);
			const list = readPointer(dataModel, listPath);
			return Array.isArray(list)
				? list
						.slice(0, MAX_TEMPLATE_ITEMS)
						.map((_, index) =>
							renderChild(
								children.componentId,
								{ base: `${listPath}/${index}` },
								`${index}`,
							),
						)
				: [];
		}
		return [];
	};

	const rendered = (
		<Adapter
			component={component}
			scope={scope}
			renderChild={renderChild}
			renderChildren={renderChildren}
		/>
	);
	return typeof component.weight === "number" &&
		Number.isFinite(component.weight) ? (
		// The weight is the agent's own number, so it cannot be a class.
		<div className="min-w-0" style={{ flexGrow: component.weight }}>
			{rendered}
		</div>
	) : (
		rendered
	);
};
