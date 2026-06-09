import type { ThemeName } from '../types/index.js'

// ─── Built-in theme names ────────────────────────────────────────

export type BuiltInThemeName = Exclude<ThemeName, 'custom'>

// ─── Theme tokens ─────────────────────────────────────────────────

const themeStyles: Record<BuiltInThemeName, string> = {
  light: `:root{
  --vf-primary:#6366f1;
  --vf-on-primary:#ffffff;
  --vf-background:#ffffff;
  --vf-surface:#f9fafb;
  --vf-text:#111827;
  --vf-text-muted:#6b7280;
  --vf-border:#e5e7eb;
  --vf-row-alt:#f5f5f5;
  --vf-row-hover:#ede9fe;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#6366f1;
  --vf-chart-2:#8b5cf6;
  --vf-chart-3:#ec4899;
  --vf-chart-4:#f59e0b;
  --vf-chart-5:#10b981;
}`,
  dark: `:root{
  --vf-primary:#818cf8;
  --vf-on-primary:#1e1b4b;
  --vf-background:#1f2937;
  --vf-surface:#111827;
  --vf-text:#f9fafb;
  --vf-text-muted:#9ca3af;
  --vf-border:#374151;
  --vf-row-alt:#273244;
  --vf-row-hover:#312e81;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#818cf8;
  --vf-chart-2:#a78bfa;
  --vf-chart-3:#f472b6;
  --vf-chart-4:#fbbf24;
  --vf-chart-5:#34d399;
}`,
  hot: `:root{
  --vf-primary:#ef4444;
  --vf-on-primary:#ffffff;
  --vf-background:#fff7ed;
  --vf-surface:#ffedd5;
  --vf-text:#431407;
  --vf-text-muted:#9a3412;
  --vf-border:#fed7aa;
  --vf-row-alt:#fff7ed;
  --vf-row-hover:#fed7aa;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#ef4444;
  --vf-chart-2:#f97316;
  --vf-chart-3:#f59e0b;
  --vf-chart-4:#eab308;
  --vf-chart-5:#dc2626;
}`,
  cold: `:root{
  --vf-primary:#0ea5e9;
  --vf-on-primary:#ffffff;
  --vf-background:#f0f9ff;
  --vf-surface:#e0f2fe;
  --vf-text:#0c4a6e;
  --vf-text-muted:#0369a1;
  --vf-border:#bae6fd;
  --vf-row-alt:#f0f9ff;
  --vf-row-hover:#bae6fd;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#0ea5e9;
  --vf-chart-2:#06b6d4;
  --vf-chart-3:#3b82f6;
  --vf-chart-4:#6366f1;
  --vf-chart-5:#14b8a6;
}`,
  corporate: `:root{
  --vf-primary:#2563eb;
  --vf-on-primary:#ffffff;
  --vf-background:#f8fafc;
  --vf-surface:#ffffff;
  --vf-text:#0f172a;
  --vf-text-muted:#64748b;
  --vf-border:#cbd5e1;
  --vf-row-alt:#f1f5f9;
  --vf-row-hover:#dbeafe;
  --vf-radius:10px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#2563eb;
  --vf-chart-2:#64748b;
  --vf-chart-3:#0ea5e9;
  --vf-chart-4:#475569;
  --vf-chart-5:#1d4ed8;
}`,
  emerald: `:root{
  --vf-primary:#10b981;
  --vf-on-primary:#ffffff;
  --vf-background:#ecfdf5;
  --vf-surface:#ffffff;
  --vf-text:#064e3b;
  --vf-text-muted:#047857;
  --vf-border:#a7f3d0;
  --vf-row-alt:#d1fae5;
  --vf-row-hover:#a7f3d0;
  --vf-radius:10px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#10b981;
  --vf-chart-2:#34d399;
  --vf-chart-3:#059669;
  --vf-chart-4:#14b8a6;
  --vf-chart-5:#22c55e;
}`,
  midnight: `:root{
  --vf-primary:#8b5cf6;
  --vf-on-primary:#ffffff;
  --vf-background:#020617;
  --vf-surface:#0f172a;
  --vf-text:#f8fafc;
  --vf-text-muted:#94a3b8;
  --vf-border:#334155;
  --vf-row-alt:#111827;
  --vf-row-hover:#312e81;
  --vf-radius:12px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#8b5cf6;
  --vf-chart-2:#06b6d4;
  --vf-chart-3:#f472b6;
  --vf-chart-4:#facc15;
  --vf-chart-5:#22c55e;
}`,
  sunset: `:root{
  --vf-primary:#f97316;
  --vf-on-primary:#ffffff;
  --vf-background:#fff7ed;
  --vf-surface:#ffffff;
  --vf-text:#431407;
  --vf-text-muted:#9a3412;
  --vf-border:#fed7aa;
  --vf-row-alt:#ffedd5;
  --vf-row-hover:#fed7aa;
  --vf-radius:10px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#f97316;
  --vf-chart-2:#fb7185;
  --vf-chart-3:#facc15;
  --vf-chart-4:#ef4444;
  --vf-chart-5:#a855f7;
}`,
  ocean: `:root{
  --vf-primary:#38bdf8;
  --vf-on-primary:#082f49;
  --vf-background:#04111f;
  --vf-surface:#0b2538;
  --vf-text:#e0f2fe;
  --vf-text-muted:#7dd3fc;
  --vf-border:#164e63;
  --vf-row-alt:#0c344d;
  --vf-row-hover:#075985;
  --vf-radius:12px;
  --vf-font:system-ui,sans-serif;
  --vf-chart-1:#38bdf8;
  --vf-chart-2:#14b8a6;
  --vf-chart-3:#0ea5e9;
  --vf-chart-4:#2563eb;
  --vf-chart-5:#67e8f9;
}`,
}

/**
 * Returns CSS custom properties for one of the built-in VizFlow themes.
 */
export function buildThemeStyle(theme: BuiltInThemeName = 'light'): string {
  return themeStyles[theme]
}