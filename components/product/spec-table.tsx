import { formatSpecValue, type SpecRow } from "@/lib/specs";

interface SpecTableProps {
  columns: string[];
  rows: SpecRow[];
}

export function SpecTable({ columns, rows }: SpecTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-border py-2 pr-4 text-left font-medium text-muted-foreground">
              &nbsp;
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-border px-4 py-2 text-left font-medium text-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border-b border-border py-2 pr-4 text-muted-foreground">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={index} className="border-b border-border px-4 py-2 text-foreground">
                  {formatSpecValue(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}