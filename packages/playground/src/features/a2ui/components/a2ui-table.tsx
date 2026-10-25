import {
	cn,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@semoss/ui/next";
import { useA2uiSurface } from "../a2ui-surface.context";
import { resolveValue } from "../binding/a2ui-binding";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";

interface TableColumn {
	header: string;
	key: string;
	align?: string;
}

const isColumn = (value: unknown): value is TableColumn =>
	typeof value === "object" &&
	value !== null &&
	typeof (value as TableColumn).header === "string" &&
	typeof (value as TableColumn).key === "string";

const cellText = (value: unknown): string =>
	typeof value === "string" ||
	typeof value === "number" ||
	typeof value === "boolean"
		? String(value)
		: "";

/**
 * `Table` (an extension to the basic catalog): `columns` name a header and the
 * key to read, `data` binds the rows in the data model. Columns share their
 * widths, which a List of Rows cannot do.
 */
export const A2uiTable = ({ component, scope }: A2uiAdapterProps) => {
	const { dataModel } = useA2uiSurface();
	const columns = Array.isArray(component.columns)
		? component.columns.filter(isColumn)
		: [];
	const rows = resolveValue(component.data, dataModel, scope);
	const items = Array.isArray(rows) ? rows : [];
	const alignment = (column: TableColumn) =>
		column.align === "end" ? "text-right" : undefined;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead
							key={column.key}
							className={cn("text-xs", alignment(column))}
						>
							{column.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: rows have no id
					<TableRow key={index}>
						{columns.map((column) => (
							<TableCell
								key={column.key}
								className={cn(
									"whitespace-normal",
									alignment(column),
								)}
							>
								{cellText(
									(item as Record<string, unknown> | null)?.[
										column.key
									],
								)}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
