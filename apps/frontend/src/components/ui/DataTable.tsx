import type { ReactNode } from 'react';
import { COLORS } from '../../constants/colors';
import DeleteRowIcon from '../../icons/delete-row.icon';
import DownloadIcon from '../../icons/download.icon';
import PencilIcon from '../../icons/pencil.icon';
import IconButton from './IconButton';

const HEADER_ROW_BACKGROUND = `color-mix(in srgb, ${COLORS.primary} 12%, ${COLORS.white})`;

export type DataTableHeaderVariant = 'primary' | 'default';

export type DataTableBuiltinAction = 'edit' | 'delete' | 'download';

type StringKey<Row> = Extract<keyof Row, string>;

interface DataTableColumnBase {
  id: string;
  header: ReactNode;
  /** Column header label color. Defaults to primary to match document table spec. */
  headerVariant?: DataTableHeaderVariant;
  /** When true, shows a sort affordance (design); wire `onColumnSort` to handle clicks. */
  sortable?: boolean;
}

export type DataTableColumnDef<Row extends Record<string, unknown>> =
  | (DataTableColumnBase & {
    kind: 'text';
    accessorKey: StringKey<Row>;
    render?: (row: Row) => ReactNode;
    tone?: 'primary' | 'secondary';
    /** @default 'normal' */
    fontWeight?: 'normal' | 'semibold';
  })
  | (DataTableColumnBase & {
    kind: 'title';
    accessorKey: StringKey<Row>;
  })
  | (DataTableColumnBase & {
    kind: 'person';
    accessorKey: StringKey<Row>;
    /** Optional image URL field on the row; falls back to initial letter when missing or empty. */
    avatarKey?: StringKey<Row>;
  })
  | (DataTableColumnBase & {
    kind: 'actions';
    actions: readonly DataTableBuiltinAction[];
  })
  | (DataTableColumnBase & {
    kind: 'badge';
    accessorKey: StringKey<Row>;
    /** Maps row value to label; default treats `active` / `inactive` (case-insensitive). */
    badgeVariant?: 'success' | 'neutral';
  });

export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: DataTableColumnDef<Row>[];
  data: Row[];
  getRowId: (row: Row) => string;
  onRowAction?: (action: DataTableBuiltinAction, row: Row) => void;
  /** Called when a column header with `sortable: true` is activated. */
  onColumnSort?: (columnId: string) => void;
  /** Renders below the grid with a top divider (e.g. pagination). */
  footer?: ReactNode;
  minWidth?: number | string;
  wrapperClassName?: string;
  tableClassName?: string;
}

function headerColor(variant: DataTableHeaderVariant | undefined) {
  if (variant === 'default') return COLORS.textPrimary;
  return COLORS.primary;
}

function getString<Row extends Record<string, unknown>>(row: Row, key: StringKey<Row>): string {
  const value = row[key];
  if (value == null) return '';
  return String(value);
}

function SortGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <path d="M3 4.5L6 1.5L9 4.5" stroke={COLORS.textSecondary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7.5L6 10.5L9 7.5" stroke={COLORS.textSecondary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfGlyph() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V21C1 21.5304 1.21071 22.0391 1.58579 22.4142C1.96086 22.7893 2.46957 23 3 23H17C17.5304 23 18.0391 22.7893 18.4142 22.4142C18.7893 22.0391 19 21.5304 19 21V8L12 1Z"
        stroke={COLORS.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 1V8H19" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ACTION_ARIA: Record<DataTableBuiltinAction, string> = {
  edit: 'Ubah',
  delete: 'Hapus',
  download: 'Unduh',
};

function renderBuiltinActionIcon(action: DataTableBuiltinAction) {
  switch (action) {
    case 'edit':
      return <PencilIcon className="h-[18px] w-[18px]" fill={COLORS.textSecondary} />;
    case 'delete':
      return <DeleteRowIcon className="h-[18px] w-[18px]" fill={COLORS.primary} />;
    case 'download':
      return <DownloadIcon className="h-[18px] w-[18px]" />;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function renderCell<Row extends Record<string, unknown>>(
  column: DataTableColumnDef<Row>,
  row: Row,
  onRowAction: DataTableProps<Row>['onRowAction']
) {
  switch (column.kind) {
    case 'title': {
      const text = getString(row, column.accessorKey);
      return (
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 [&>svg]:h-5 [&>svg]:w-[15px]">
            <PdfGlyph />
          </span>
          <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
            {text}
          </span>
        </div>
      );
    }
    case 'text': {
      if (column.render) {
        return column.render(row);
      }
      const text = getString(row, column.accessorKey);
      const isSecondary = column.tone === 'secondary';
      const weightClass = column.fontWeight === 'semibold' ? 'font-semibold' : 'font-normal';
      return (
        <span
          className={`text-sm ${weightClass}`}
          style={{ color: isSecondary ? COLORS.textSecondary : COLORS.textPrimary }}
        >
          {text}
        </span>
      );
    }
    case 'person': {
      const name = getString(row, column.accessorKey);
      const initial = name.charAt(0) || '?';
      const avatarUrl =
        column.avatarKey != null ? getString(row, column.avatarKey).trim() : '';

      return (
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              style={{ border: `1px solid ${COLORS.border}` }}
            />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: COLORS.border, color: COLORS.textSecondary }}
            >
              {initial}
            </div>
          )}
          <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
            {name}
          </span>
        </div>
      );
    }
    case 'badge': {
      const val = getString(row, column.accessorKey);
      const raw = val.toLowerCase();
      const isActive = raw === 'active' || raw === 'aktif';
      const isInactive = raw === 'inactive' || raw === 'nonaktif';
      const label = isActive ? 'Aktif' : isInactive ? 'Nonaktif' : val;
      const variant = column.badgeVariant ?? (isActive ? 'success' : 'neutral');
      const bg =
        variant === 'success'
          ? 'color-mix(in srgb, #22C55E 14%, #FFFFFF)'
          : 'color-mix(in srgb, #6B7280 12%, #FFFFFF)';
      const fg = variant === 'success' ? '#15803D' : COLORS.textSecondary;
      return (
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: bg, color: fg }}
        >
          {label}
        </span>
      );
    }
    case 'actions':
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          {column.actions.map((action) => (
            <IconButton
              key={action}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0 transition-colors hover:bg-gray-100"
              icon={renderBuiltinActionIcon(action)}
              aria-label={ACTION_ARIA[action]}
              onClick={onRowAction ? () => onRowAction(action, row) : undefined}
            />
          ))}
        </div>
      );
    default: {
      const _exhaustive: never = column;
      return _exhaustive;
    }
  }
}

export default function DataTable<Row extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  onRowAction,
  onColumnSort,
  footer,
  minWidth = 720,
  wrapperClassName = '',
  tableClassName = '',
}: DataTableProps<Row>) {
  const minWidthCss = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white shadow-sm ${wrapperClassName}`.trim()}
      style={{ borderColor: COLORS.border }}
    >
      <div className="overflow-x-auto">
        <table className={`w-full min-w-0 ${tableClassName}`.trim()} style={{ minWidth: minWidthCss }}>
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: COLORS.border,
                backgroundColor: HEADER_ROW_BACKGROUND,
              }}
            >
              {columns.map((col) => (
                <th key={col.id} className="px-6 py-4 text-left align-middle">
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex max-w-full items-center gap-2 rounded text-left transition-opacity hover:opacity-80"
                      style={{ color: headerColor(col.headerVariant) }}
                      onClick={() => onColumnSort?.(col.id)}
                    >
                      <span className="text-xs font-bold uppercase tracking-wide">{col.header}</span>
                      <SortGlyph />
                    </button>
                  ) : (
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: headerColor(col.headerVariant) }}
                    >
                      {col.header}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={getRowId(row)}
                className="transition-colors hover:bg-gray-50"
                style={{
                  backgroundColor: COLORS.white,
                  borderBottom: idx < data.length - 1 ? `1px solid ${COLORS.border}` : undefined,
                }}
              >
                {columns.map((col) => (
                  <td key={col.id} className="px-6 py-4 align-middle">
                    {renderCell(col, row, onRowAction)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer != null ? (
        <div
          className="border-t px-6 py-4"
          style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
