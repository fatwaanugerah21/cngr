import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { COLORS } from '../../constants/colors';
import {
  formatAmountWithSuffix,
  formatTableDate,
  getTableDateTimestamp,
  parsePercentDisplay,
} from '../../lib/formatters';
import DeleteRowIcon from '../../icons/delete-row.icon';
import DownloadIcon from '../../icons/download.icon';
import PencilIcon from '../../icons/pencil.icon';
import IconButton from './IconButton';

const TABLE_HEADER_BACKGROUND = '#F0F7FF';
const TABLE_HEADER_TEXT = '#006FFF';
const DEFAULT_EMPTY_MESSAGE = 'Tidak ada data untuk ditampilkan.';

export type DataTableHeaderVariant = 'primary' | 'default';

export type DataTableBuiltinAction = 'edit' | 'delete' | 'download';

export type DataTableSortDirection = 'asc' | 'desc';

export type DataTableSortState = {
  columnId: string;
  direction: DataTableSortDirection;
};

type StringKey<Row> = Extract<keyof Row, string>;

interface DataTableColumnBase {
  id: string;
  header: ReactNode;
  /** Column header label color. Defaults to primary to match document table spec. */
  headerVariant?: DataTableHeaderVariant;
  /** Enables click-to-sort on the column header. */
  sortable?: boolean;
  /** Caps column width (e.g. 240 or '18rem'). */
  maxWidth?: number | string;
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
    kind: 'number';
    accessorKey: StringKey<Row>;
    /** Appended to formatted values (e.g. Ha). */
    unitSuffix?: string;
    tone?: 'primary' | 'secondary';
    /** @default 'normal' */
    fontWeight?: 'normal' | 'semibold';
  })
  | (DataTableColumnBase & {
    kind: 'date';
    accessorKey: StringKey<Row>;
    tone?: 'primary' | 'secondary';
    /** @default 'normal' */
    fontWeight?: 'normal' | 'semibold';
  })
  | (DataTableColumnBase & {
    kind: 'title';
    accessorKey: StringKey<Row>;
    /** Secondary line under the title (e.g. description). */
    subtitleKey?: StringKey<Row>;
  })
  | (DataTableColumnBase & {
    kind: 'person';
    accessorKey: StringKey<Row>;
    /** Optional image URL field on the row; falls back to initial letter when missing or empty. */
    avatarKey?: StringKey<Row>;
    /** Label when name is empty. @default '—' */
    emptyLabel?: string;
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
  /** Renders below the grid with a top divider (e.g. pagination). */
  footer?: ReactNode;
  minWidth?: number | string;
  wrapperClassName?: string;
  tableClassName?: string;
  /** Shown with a fade-in when `data` is empty. */
  emptyMessage?: ReactNode;
  /** Initial column sort applied when the table mounts. */
  defaultSort?: DataTableSortState;
}

function headerColor(variant: DataTableHeaderVariant | undefined) {
  if (variant === 'default') return COLORS.textPrimary;
  return TABLE_HEADER_TEXT;
}

function getString<Row extends Record<string, unknown>>(row: Row, key: StringKey<Row>): string {
  const value = row[key];
  if (value == null) return '';
  return String(value);
}

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function columnWidthStyle(maxWidth: number | string | undefined): CSSProperties | undefined {
  if (maxWidth == null) {
    return undefined;
  }
  const width = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  return { maxWidth: width, width };
}

function personDisplayName(raw: string, emptyLabel: string): string {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'unknown') {
    return emptyLabel;
  }
  return trimmed;
}

function personInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function getNumber<Row extends Record<string, unknown>>(row: Row, key: StringKey<Row>): number | null {
  const value = row[key];
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

type SortableColumn<Row extends Record<string, unknown>> = Extract<
  DataTableColumnDef<Row>,
  { accessorKey: StringKey<Row> }
>;

function isSortableColumn<Row extends Record<string, unknown>>(
  column: DataTableColumnDef<Row>
): column is SortableColumn<Row> {
  return column.sortable === true && 'accessorKey' in column;
}

function getColumnSortValue<Row extends Record<string, unknown>>(
  row: Row,
  column: SortableColumn<Row>
): number | string {
  switch (column.kind) {
    case 'date':
      return getTableDateTimestamp(getString(row, column.accessorKey));
    case 'number':
      return getNumber(row, column.accessorKey) ?? 0;
    case 'text': {
      const text = getString(row, column.accessorKey);
      if (text.includes('%')) {
        return parsePercentDisplay(text);
      }
      return text.toLowerCase();
    }
    case 'badge':
      return getString(row, column.accessorKey).toLowerCase();
    default:
      return '';
  }
}

function compareSortValues(left: number | string, right: number | string): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right), 'id', { numeric: true });
}

function defaultSortDirectionForColumn<Row extends Record<string, unknown>>(
  column: SortableColumn<Row>
): DataTableSortDirection {
  return column.kind === 'date' || column.kind === 'number' || column.kind === 'text' ? 'desc' : 'asc';
}

function SortIndicator({
  direction,
  active,
  color,
}: {
  direction: DataTableSortDirection | null;
  active: boolean;
  color: string;
}) {
  const inactiveColor = 'color-mix(in srgb, currentColor 35%, transparent)';
  const ascColor = active && direction === 'asc' ? color : inactiveColor;
  const descColor = active && direction === 'desc' ? color : inactiveColor;

  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="none"
      className="inline-block shrink-0"
      aria-hidden
    >
      <path
        d="M1.5 4.5L5 1.5L8.5 4.5"
        stroke={ascColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 9.5L5 12.5L8.5 9.5"
        stroke={descColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      const subtitleKey = column.subtitleKey;
      const hasSubtitle = subtitleKey != null;
      const subtitleRaw = hasSubtitle ? getString(row, subtitleKey).trim() : '';
      const subtitle = subtitleRaw !== '' ? truncateText(subtitleRaw, 72) : '—';

      if (hasSubtitle) {
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 scale-90 [&>svg]:h-4 [&>svg]:w-3">
              <PdfGlyph />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p
                className="truncate text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
                title={text}
              >
                {text}
              </p>
              <p
                className="truncate text-[11px]"
                style={{ color: COLORS.textSecondary }}
                title={subtitleRaw !== '' ? subtitleRaw : undefined}
              >
                {subtitle}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 [&>svg]:h-4 [&>svg]:w-3">
            <PdfGlyph />
          </span>
          <span
            className="truncate text-sm font-semibold"
            style={{ color: COLORS.textPrimary }}
            title={text}
          >
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
    case 'number': {
      const numericValue = getNumber(row, column.accessorKey);
      const text = formatAmountWithSuffix(numericValue, column.unitSuffix);
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
    case 'date': {
      const text = formatTableDate(getString(row, column.accessorKey));
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
      const rawName = getString(row, column.accessorKey);
      const emptyLabel = column.emptyLabel ?? '—';
      const name = personDisplayName(rawName, emptyLabel);
      const hasName = name !== emptyLabel;
      const initial = hasName ? personInitials(name) : '?';
      const avatarUrl =
        column.avatarKey != null ? getString(row, column.avatarKey).trim() : '';

      return (
        <div className="flex min-w-0 items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              style={{ border: `1px solid ${COLORS.border}` }}
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor: hasName ? 'color-mix(in srgb, #006FFF 12%, #FFFFFF)' : COLORS.border,
                color: hasName ? TABLE_HEADER_TEXT : COLORS.textSecondary,
              }}
            >
              {initial}
            </div>
          )}
          <span
            className="min-w-0 truncate text-sm font-semibold leading-snug"
            style={{ color: hasName ? COLORS.textPrimary : COLORS.textSecondary }}
            title={hasName ? name : undefined}
          >
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
        <div className="flex select-none items-center gap-2 sm:gap-3">
          {column.actions.map((action) => (
            <IconButton
              key={action}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-colors hover:bg-gray-100"
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
  footer,
  minWidth = 720,
  wrapperClassName = '',
  tableClassName = '',
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  defaultSort,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<DataTableSortState | null>(() => defaultSort ?? null);
  const minWidthCss = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
  const isEmpty = data.length === 0;

  const sortedData = useMemo(() => {
    if (!sort) {
      return data;
    }

    const column = columns.find((col) => col.id === sort.columnId);
    if (!column || !isSortableColumn(column)) {
      return data;
    }

    const directionMultiplier = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((left, right) => {
      const comparison = compareSortValues(
        getColumnSortValue(left, column),
        getColumnSortValue(right, column)
      );
      return comparison * directionMultiplier;
    });
  }, [columns, data, sort]);

  const handleSortHeader = (column: DataTableColumnDef<Row>) => {
    if (!isSortableColumn(column)) {
      return;
    }

    setSort((current) => {
      if (current?.columnId === column.id) {
        return {
          columnId: column.id,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        columnId: column.id,
        direction: defaultSortDirectionForColumn(column),
      };
    });
  };

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
                backgroundColor: TABLE_HEADER_BACKGROUND,
              }}
            >
              {columns.map((col) => {
                const headerTone = headerColor(col.headerVariant);
                const isActiveSort = sort?.columnId === col.id;
                const sortDirection = isActiveSort ? sort.direction : null;

                return (
                  <th
                    key={col.id}
                    className={`px-4 py-3 text-left align-middle${col.kind === 'actions' ? ' select-none' : ''}`}
                    style={columnWidthStyle(col.maxWidth)}
                    aria-sort={
                      isSortableColumn(col) && isActiveSort
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {isSortableColumn(col) ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide transition-opacity hover:opacity-80"
                        style={{ color: headerTone }}
                        onClick={() => handleSortHeader(col)}
                      >
                        <span className="text-xs font-bold">{col.header}</span>
                        <SortIndicator
                          direction={sortDirection}
                          active={isActiveSort}
                          color={headerTone}
                        />
                      </button>
                    ) : (
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: headerTone }}
                      >
                        {col.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center align-middle">
                  <div
                    key="data-table-empty"
                    className="animate-data-table-empty mx-auto max-w-md text-sm"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={getRowId(row)}
                  className="transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: COLORS.white,
                    borderBottom: idx < sortedData.length - 1 ? `1px solid ${COLORS.border}` : undefined,
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`px-4 py-3 align-middle${col.kind === 'actions' ? ' select-none' : ''}`}
                      style={columnWidthStyle(col.maxWidth)}
                    >
                      {renderCell(col, row, onRowAction)}
                    </td>
                  ))}
                </tr>
              ))
            )}
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
