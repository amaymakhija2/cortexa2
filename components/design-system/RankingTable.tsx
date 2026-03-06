import React, { useMemo } from 'react';
import { Users } from 'lucide-react';

// =============================================================================
// FONTS & STYLE TOKENS
// =============================================================================

const FONT = {
  serif: "'Tiempos Headline', Georgia, serif",
  sans: "'Suisse Intl', sans-serif",
} as const;

const COLOR = {
  ink: '#1c1917',
  dark: '#292524',
  body: '#44403c',
  muted: '#57534e',
  stone: '#78716c',
  faded: '#a8a29e',
  rule: '#e7e5e4',
  dashed: '#D6D3D1',
} as const;

// Shared static styles to avoid re-creating objects per render
const S = {
  headerFont: {
    fontFamily: FONT.sans,
    fontSize: 11,
    fontWeight: 600,
    color: COLOR.stone,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  nameText: {
    fontFamily: FONT.serif,
    fontSize: 18,
    color: COLOR.ink,
    lineHeight: 1.25,
  },
  nameMobile: {
    fontFamily: FONT.serif,
    fontSize: 17,
    color: COLOR.ink,
    lineHeight: 1.25,
  },
  subtitle: {
    fontFamily: FONT.sans,
    fontSize: 11,
    color: COLOR.faded,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
    marginTop: 2,
  },
  subtitleMobile: {
    fontFamily: FONT.sans,
    fontSize: 10,
    color: COLOR.faded,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
    marginTop: 1,
  },
  primaryValue: {
    fontFamily: FONT.sans,
    fontSize: 20,
    fontWeight: 700,
    color: COLOR.ink,
    lineHeight: 1,
  },
  primaryValueMobile: {
    fontFamily: FONT.sans,
    fontSize: 18,
    fontWeight: 700,
    color: COLOR.ink,
    lineHeight: 1,
  },
  rank: {
    fontFamily: FONT.sans,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  rankMobile: {
    fontFamily: FONT.sans,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    minWidth: 24,
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  avgName: {
    fontFamily: FONT.serif,
    fontSize: 17,
    color: COLOR.stone,
    lineHeight: 1.2,
    fontStyle: 'italic' as const,
  },
  avgNameMobile: {
    fontFamily: FONT.serif,
    fontSize: 16,
    color: COLOR.stone,
    lineHeight: 1.2,
    fontStyle: 'italic' as const,
  },
  avgValue: {
    fontFamily: FONT.sans,
    fontSize: 18,
    fontWeight: 600,
    color: COLOR.stone,
    lineHeight: 1,
  },
  avgValueMobile: {
    fontFamily: FONT.sans,
    fontSize: 18,
    fontWeight: 600,
    color: COLOR.stone,
    lineHeight: 1,
  },
  avgSupporting: {
    fontFamily: FONT.sans,
    fontSize: 16,
    fontWeight: 600,
    color: COLOR.stone,
    lineHeight: 1,
  },
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface RankingColumn {
  key: string;
  label: string;
  format: (value: number) => string;
  tooltip?: string;
  isPrimary?: boolean;
  hidden?: boolean;
}

export interface RankingRow {
  id: string | number;
  name: string;
  subtitle: string;
  accentColor?: string;
  values: Record<string, number>;
}

export interface RankingTheme {
  first: { text: string };
  last: { text: string };
  default: { text: string };
}

export interface LegendItem {
  color: string;
  label: string;
}

interface RankingTableProps {
  rows: RankingRow[];
  primaryColumn: RankingColumn;
  supportingColumns: RankingColumn[];
  onRowClick?: (id: string | number | null) => void;
  teamAverageLabel?: string;
  teamAverageInsertIndex?: number;
  theme?: RankingTheme;
  legend?: LegendItem[];
  tooltipComponent?: React.FC<{ text: string }>;
}

const DEFAULT_THEME: RankingTheme = {
  first: { text: '#059669' },
  last: { text: '#dc2626' },
  default: { text: COLOR.body },
};

// =============================================================================
// INTERNAL: InfoTooltip fallback
// =============================================================================

const DefaultTooltip: React.FC<{ text: string }> = ({ text }) => (
  <span className="relative group cursor-help ml-1">
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-current opacity-50 text-[9px]">i</span>
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs text-white bg-stone-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {text}
    </span>
  </span>
);

// =============================================================================
// TEAM AVERAGE ROW (extracted, stable reference)
// =============================================================================

const TeamAverageRow: React.FC<{
  gridColumns: string;
  primaryColumn: RankingColumn;
  supportingColumns: RankingColumn[];
  averages: Record<string, number>;
  count: number;
  label: string;
  onClick?: () => void;
}> = React.memo(({ gridColumns, primaryColumn, supportingColumns, averages, count, label, onClick }) => (
  <div
    className="cursor-pointer transition-colors duration-150 hover:bg-stone-100/50"
    style={{ borderBottom: `1px dashed ${COLOR.dashed}` }}
    onClick={onClick}
  >
    {/* Mobile */}
    <div className="lg:hidden py-4 px-4 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: COLOR.dashed, minHeight: 40 }} />
        <Users size={16} style={{ color: COLOR.faded, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <h3 style={S.avgNameMobile}>{label}</h3>
          <p style={S.subtitleMobile}>{count} clinicians</p>
        </div>
        <span style={S.avgValueMobile}>
          {primaryColumn.format(averages[primaryColumn.key] ?? 0)}
        </span>
      </div>
    </div>

    {/* Desktop */}
    <div className="hidden lg:flex items-center py-4 gap-4">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: COLOR.dashed, minHeight: 40 }} />
      <div className="flex-1 grid items-center" style={{ gridTemplateColumns: gridColumns }}>
        <div className="flex justify-center">
          <Users size={16} style={{ color: COLOR.faded }} />
        </div>
        <div className="min-w-0">
          <h3 style={S.avgName}>{label}</h3>
          <p style={S.subtitle}>{count} clinicians</p>
        </div>
        {!primaryColumn.hidden && (
          <div className="text-center">
            <span style={S.avgValue}>
              {primaryColumn.format(averages[primaryColumn.key] ?? 0)}
            </span>
          </div>
        )}
        {supportingColumns.map((col) => (
          <div key={col.key} className="text-center">
            <span style={S.avgSupporting}>
              {col.format(averages[col.key] ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
));
TeamAverageRow.displayName = 'TeamAverageRow';

// =============================================================================
// CLINICIAN ROW (extracted, stable reference)
// =============================================================================

const ClinicianRow: React.FC<{
  row: RankingRow;
  rank: number;
  rankColor: string;
  gridColumns: string;
  primaryColumn: RankingColumn;
  supportingColumns: RankingColumn[];
  onClick?: () => void;
}> = React.memo(({ row, rank, rankColor, gridColumns, primaryColumn, supportingColumns, onClick }) => {
  const primaryValue = row.values[primaryColumn.key] ?? 0;

  return (
    <div
      className="group cursor-pointer transition-colors duration-150 hover:bg-stone-50/80"
      style={{ borderBottom: `1px solid ${COLOR.rule}` }}
      onClick={onClick}
    >
      {/* Mobile */}
      <div className="lg:hidden py-4 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: row.accentColor || COLOR.stone, minHeight: 40 }} />
          <span style={{ ...S.rankMobile, color: rankColor }}>
            {rank}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="truncate" style={S.nameMobile}>{row.name}</h3>
            <p className="truncate" style={S.subtitleMobile}>{row.subtitle}</p>
          </div>
          <span style={S.primaryValueMobile}>
            {primaryColumn.format(primaryValue)}
          </span>
        </div>
        {supportingColumns.length > 0 && (
          <div className="mt-2 pl-[36px] flex gap-4" style={{ fontFamily: FONT.sans }}>
            {supportingColumns.map((col) => (
              <span key={col.key} style={{ fontSize: 11, color: col.isPrimary ? COLOR.muted : COLOR.faded, fontWeight: col.isPrimary ? 600 : 400 }}>
                {col.label}: {col.format(row.values[col.key] ?? 0)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center py-[18px] gap-4">
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: row.accentColor || COLOR.stone, minHeight: 44 }}
        />
        <div className="flex-1 grid items-center" style={{ gridTemplateColumns: gridColumns }}>
          <div className="flex justify-center">
            <span style={{ ...S.rank, color: rankColor }}>{rank}</span>
          </div>
          <div className="min-w-0" style={{ paddingLeft: 4 }}>
            <h3 className="truncate" style={S.nameText}>{row.name}</h3>
            <p className="truncate" style={S.subtitle}>{row.subtitle}</p>
          </div>
          {!primaryColumn.hidden && (
            <div className="text-center">
              <span style={S.primaryValue}>
                {primaryColumn.format(primaryValue)}
              </span>
            </div>
          )}
          {supportingColumns.map((col) => (
            <div key={col.key} className="text-center">
              <span style={{
                fontFamily: FONT.sans,
                fontSize: 18,
                fontWeight: col.isPrimary ? 600 : 500,
                color: col.isPrimary ? COLOR.body : COLOR.stone,
                lineHeight: 1,
              }}>
                {col.format(row.values[col.key] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
ClinicianRow.displayName = 'ClinicianRow';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RankingTable: React.FC<RankingTableProps> = ({
  rows,
  primaryColumn,
  supportingColumns,
  onRowClick,
  teamAverageLabel = 'Team Average',
  teamAverageInsertIndex,
  theme = DEFAULT_THEME,
  legend,
  tooltipComponent: Tooltip = DefaultTooltip,
}) => {
  // Compute grid columns once
  const gridColumns = useMemo(() => {
    const dataColumns = supportingColumns.length + (primaryColumn.hidden ? 0 : 1);
    return `44px minmax(140px, 240px) ${Array(dataColumns).fill('1fr').join(' ')}`;
  }, [supportingColumns.length, primaryColumn.hidden]);

  // Pre-compute team averages
  const teamAverages = useMemo(() => {
    if (rows.length === 0) return {};
    const allKeys = [primaryColumn.key, ...supportingColumns.map(c => c.key)];
    return Object.fromEntries(
      allKeys.map(key => [
        key,
        rows.reduce((sum, r) => sum + (r.values[key] ?? 0), 0) / rows.length,
      ])
    );
  }, [rows, primaryColumn.key, supportingColumns]);

  const getRankColor = (idx: number) => {
    if (idx === 0) return theme.first.text;
    if (idx === rows.length - 1) return theme.last.text;
    return theme.default.text;
  };

  const showTeamAvg = teamAverageInsertIndex !== undefined;

  return (
    <div>
      {/* Column headers */}
      <div
        className="hidden lg:grid items-end pb-3 mb-0"
        style={{
          ...S.headerFont,
          borderBottom: `2px solid ${COLOR.dark}`,
          marginLeft: 20,
          gridTemplateColumns: gridColumns,
        }}
      >
        <div className="text-center" style={{ color: COLOR.faded }}>#</div>
        <div>Clinician</div>
        {!primaryColumn.hidden && (
          <div className="flex items-center justify-center gap-1.5" style={{ color: COLOR.muted }}>
            {primaryColumn.label}
            {primaryColumn.tooltip && <Tooltip text={primaryColumn.tooltip} />}
          </div>
        )}
        {supportingColumns.map((col) => (
          <div key={col.key} className="flex items-center justify-center gap-1.5" style={{ color: col.isPrimary ? COLOR.muted : COLOR.stone }}>
            {col.label}
            {col.tooltip && <Tooltip text={col.tooltip} />}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, idx) => (
          <React.Fragment key={row.id}>
            {/* Team average inserted at correct position */}
            {showTeamAvg && idx === teamAverageInsertIndex && (
              <TeamAverageRow
                gridColumns={gridColumns}
                primaryColumn={primaryColumn}
                supportingColumns={supportingColumns}
                averages={teamAverages}
                count={rows.length}
                label={teamAverageLabel}
                onClick={onRowClick ? () => onRowClick(null) : undefined}
              />
            )}

            <ClinicianRow
              row={row}
              rank={idx + 1}
              rankColor={getRankColor(idx)}
              gridColumns={gridColumns}
              primaryColumn={primaryColumn}
              supportingColumns={supportingColumns}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
            />
          </React.Fragment>
        ))}

        {/* Team average after all rows if needed */}
        {showTeamAvg && teamAverageInsertIndex === rows.length && (
          <TeamAverageRow
            gridColumns={gridColumns}
            primaryColumn={primaryColumn}
            supportingColumns={supportingColumns}
            averages={teamAverages}
            count={rows.length}
            label={teamAverageLabel}
            onClick={onRowClick ? () => onRowClick(null) : undefined}
          />
        )}
      </div>

      {/* Legend */}
      {legend && legend.length > 0 && (
        <div className="mt-6 pt-4 flex flex-wrap items-center gap-5" style={{ borderTop: `1px solid ${COLOR.rule}`, fontFamily: FONT.sans, fontSize: 11, color: COLOR.faded }}>
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { FONT, COLOR };
