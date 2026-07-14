"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";
import type { ScanDay, DeviceBreakdown } from "@/lib/analytics";

// Fixed hue-per-entity mapping (never cycled, never re-assigned by rank) so
// "mobile" is always the same color regardless of which categories are
// present or how they sort. Falls back to muted gray for anything outside
// this known set (ua-parser-js device types plus our "desktop"/"unknown").
const KNOWN_DEVICE_TYPES = [
  "mobile",
  "desktop",
  "tablet",
  "smarttv",
  "wearable",
  "console",
  "embedded",
  "bot",
] as const;

function deviceColorVar(deviceType: string): string {
  return KNOWN_DEVICE_TYPES.includes(deviceType as (typeof KNOWN_DEVICE_TYPES)[number])
    ? `var(--device-${deviceType})`
    : "var(--muted)";
}

export function ScanTimeSeriesChart({ data }: { data: ScanDay[] }) {
  return (
    <div className="viz-root">
      <style>{`
        .viz-root { color-scheme: light; --surface-1: #f8fafc; --text-secondary: #31445a; --muted: #637083; --grid: #d8e0e8; --series-1: #1f4f85; }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root { color-scheme: light; --surface-1: #f8fafc; --text-secondary: #31445a; --muted: #637083; --grid: #d8e0e8; --series-1: #1f4f85; }
        }
        :root[data-theme="dark"] .viz-root { color-scheme: light; --surface-1: #f8fafc; --text-secondary: #31445a; --muted: #637083; --grid: #d8e0e8; --series-1: #1f4f85; }
      `}</style>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="scanArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--grid)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: "#d8e0e8" }}
            labelFormatter={(d) => d}
            formatter={(value) => [value, "Scans"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--series-1)"
            strokeWidth={2}
            fill="url(#scanArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceBreakdownChart({ data }: { data: DeviceBreakdown[] }) {
  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          color-scheme: light;
          --muted: #637083; --grid: #d8e0e8; --text-primary: #102033;
          --device-mobile: #1f4f85; --device-desktop: #4f9a4d; --device-tablet: #5194c8;
          --device-smarttv: #2f7040; --device-wearable: #64748b; --device-console: #b42318;
          --device-embedded: #c95e88; --device-bot: #d85f2a;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            color-scheme: light;
            --muted: #637083; --grid: #d8e0e8; --text-primary: #102033;
            --device-mobile: #1f4f85; --device-desktop: #4f9a4d; --device-tablet: #5194c8;
            --device-smarttv: #2f7040; --device-wearable: #64748b; --device-console: #b42318;
            --device-embedded: #c95e88; --device-bot: #d85f2a;
          }
        }
        :root[data-theme="dark"] .viz-root {
          color-scheme: light;
          --muted: #637083; --grid: #d8e0e8; --text-primary: #102033;
          --device-mobile: #1f4f85; --device-desktop: #4f9a4d; --device-tablet: #5194c8;
          --device-smarttv: #2f7040; --device-wearable: #64748b; --device-console: #b42318;
          --device-embedded: #c95e88; --device-bot: #d85f2a;
        }
      `}</style>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--grid)" />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="deviceType"
            tick={{ fontSize: 12, fill: "var(--text-primary)" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: "#d8e0e8" }} formatter={(value) => [value, "Scans"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((entry) => (
              <Cell key={entry.deviceType} fill={deviceColorVar(entry.deviceType)} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: "var(--muted)" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
