import React from 'react';
import { Rarity, Role } from '../types';
import { RoleIcon } from './RoleIcon';

// Short label for tight spaces; the full name always stays available via title and aria-label.
export const ROLE_LABELS: Record<Role, { name: string; full: string }> = {
  TOP: { name: 'TOP', full: 'Đường Trên (Top)' },
  JUNGLE: { name: 'JNG', full: 'Đi Rừng (Jungle)' },
  MID: { name: 'MID', full: 'Đường Giữa (Mid)' },
  BOT: { name: 'BOT', full: 'Xạ Thủ (Bot)' },
  SUPPORT: { name: 'SUP', full: 'Hỗ Trợ (Support)' },
};

// The one rarity system. `accent` mirrors the --color-rarity-* tokens in index.css for inline alpha uses.
export const RARITY_CONFIG: Record<Rarity, { label: string; accent: string }> = {
  COMMON: { label: 'Thường', accent: '#8D99B3' },
  RARE: { label: 'Hiếm', accent: '#5B8DEF' },
  EPIC: { label: 'Sử Thi', accent: '#E5547A' },
  LEGENDARY: { label: 'Huyền Thoại', accent: '#F5B83D' },
};

export const RoleBadge: React.FC<{ role: Role; withName?: boolean }> = ({ role, withName = true }) => {
  const info = ROLE_LABELS[role];
  return (
    <span className="badge" title={info.full} aria-label={info.full}>
      <RoleIcon role={role} />
      {withName && <span aria-hidden="true">{info.name}</span>}
    </span>
  );
};

export const RarityBadge: React.FC<{ rarity: Rarity }> = ({ rarity }) => (
  <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-fg-muted" title={`Độ hiếm: ${RARITY_CONFIG[rarity].label}`}>
    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: `var(--color-rarity-${rarity.toLowerCase()})` }} />
    {RARITY_CONFIG[rarity].label}
  </span>
);

export const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex items-baseline justify-between gap-2 text-caption text-fg-subtle">
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
      <span className="font-mono-nums font-semibold text-fg-muted">{value}</span>
    </div>
    <div className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-elevated" role="presentation">
      <div className="h-full bg-fg-subtle transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

export const PageHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <header className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      <h1 className="font-display text-title font-extrabold text-fg">{title}</h1>
      {subtitle && <p className="mt-1 text-body text-fg-muted">{subtitle}</p>}
    </div>
    {children && <div className="min-w-0 md:shrink-0">{children}</div>}
  </header>
);

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}

// Filter/switcher group: chips wrap as whole items (never mid-word) and keep a 44px touch height.
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex max-w-full flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-md px-3 text-label font-semibold transition-colors ${
              active ? 'bg-gold text-bg' : 'text-fg-muted hover:bg-elevated hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
