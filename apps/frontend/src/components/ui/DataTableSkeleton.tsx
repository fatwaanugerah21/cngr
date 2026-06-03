import { COLORS } from '../../constants/colors';
import Skeleton from './Skeleton';

const TABLE_HEADER_BACKGROUND = '#F0F7FF';

const OPERATIONAL_COLUMN_WIDTHS = ['w-28', 'w-20', 'w-20', 'w-16', 'w-24', 'w-20'] as const;
const DOCUMENT_COLUMN_WIDTHS = ['w-48', 'w-28', 'w-36', 'w-24'] as const;
const USER_COLUMN_WIDTHS = ['w-40', 'w-28', 'w-24', 'w-28', 'w-20'] as const;

export type DataTableSkeletonVariant = 'operational' | 'document' | 'user';

export type DataTableSkeletonProps = {
  variant?: DataTableSkeletonVariant;
  rowCount?: number;
  minWidth?: number | string;
  loadingLabel?: string;
  wrapperClassName?: string;
  showPaginationFooter?: boolean;
};

function TablePaginationFooterSkeleton() {
  return (
    <div
      className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
      aria-hidden
    >
      <Skeleton className="h-3 w-52" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

function renderOperationalCell(columnIndex: number, columnCount: number, widthClass: string) {
  const isStatusColumn = columnIndex === 4 && columnCount >= 5;
  const isActionsColumn = columnIndex === columnCount - 1;

  if (isActionsColumn) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <Skeleton className={`h-4 ${widthClass} ${isStatusColumn ? 'rounded-full' : ''}`} />;
}

function renderDocumentCell(columnIndex: number, widthClass: string) {
  if (columnIndex === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className={`h-4 ${widthClass}`} />
        <Skeleton className="h-3 w-4/5 max-w-[180px]" />
      </div>
    );
  }

  if (columnIndex === 2) {
    return (
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  if (columnIndex === 3) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <Skeleton className={`h-4 ${widthClass}`} />;
}

function renderUserCell(columnIndex: number, widthClass: string) {
  if (columnIndex === 0) {
    return (
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (columnIndex === 4) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <Skeleton className={`h-4 ${widthClass}`} />;
}

function getVariantConfig(variant: DataTableSkeletonVariant) {
  switch (variant) {
    case 'document':
      return {
        columnWidths: DOCUMENT_COLUMN_WIDTHS,
        minWidth: 720,
        defaultRowCount: 10,
        renderCell: renderDocumentCell,
      };
    case 'user':
      return {
        columnWidths: USER_COLUMN_WIDTHS,
        minWidth: 920,
        defaultRowCount: 10,
        renderCell: renderUserCell,
      };
    default:
      return {
        columnWidths: OPERATIONAL_COLUMN_WIDTHS,
        minWidth: 900,
        defaultRowCount: 8,
        renderCell: renderOperationalCell,
      };
  }
}

export default function DataTableSkeleton({
  variant = 'operational',
  rowCount,
  minWidth,
  loadingLabel = 'Loading table…',
  wrapperClassName = '',
  showPaginationFooter = false,
}: DataTableSkeletonProps) {
  const config = getVariantConfig(variant);
  const resolvedRowCount = rowCount ?? config.defaultRowCount;
  const resolvedMinWidth = minWidth ?? config.minWidth;
  const minWidthCss = typeof resolvedMinWidth === 'number' ? `${resolvedMinWidth}px` : resolvedMinWidth;
  const columnWidths = [...config.columnWidths];
  const columnCount = columnWidths.length;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white shadow-sm ${wrapperClassName}`.trim()}
      style={{ borderColor: COLORS.border }}
      role="status"
      aria-busy="true"
      aria-label={loadingLabel}
    >
      <span className="sr-only">{loadingLabel}</span>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0" style={{ minWidth: minWidthCss }}>
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: COLORS.border,
                backgroundColor: TABLE_HEADER_BACKGROUND,
              }}
            >
              {columnWidths.map((widthClass, index) => (
                <th key={index} className="px-4 py-3 text-left align-middle">
                  <Skeleton className={`h-3 ${widthClass}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: resolvedRowCount }, (_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b last:border-b-0"
                style={{ borderColor: COLORS.border, backgroundColor: COLORS.white }}
              >
                {columnWidths.map((widthClass, columnIndex) => (
                  <td key={columnIndex} className="px-4 py-3 align-middle">
                    {variant === 'operational'
                      ? renderOperationalCell(columnIndex, columnCount, widthClass)
                      : variant === 'document'
                        ? renderDocumentCell(columnIndex, widthClass)
                        : renderUserCell(columnIndex, widthClass)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPaginationFooter ? <TablePaginationFooterSkeleton /> : null}
    </div>
  );
}
