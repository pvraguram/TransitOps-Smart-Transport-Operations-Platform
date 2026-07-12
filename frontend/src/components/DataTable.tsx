import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-[#662549]/15 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#E8BCB9]/20 text-left text-[#662549] text-xs font-semibold uppercase">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-[#662549]/50">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="border-t border-[#662549]/10 hover:bg-[#E8BCB9]/10"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3 text-[#451952]/80">
                    {col.render ? col.render(row) : col.accessor ? col.accessor(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
