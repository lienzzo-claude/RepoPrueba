"use client";

import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MonthlyBars } from "@/components/dashboard/monthly-bars";
import {
  getRange,
  PRESET_LABELS,
  type RangePreset,
} from "@/components/dashboard/range-presets";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { TimeseriesChart } from "@/components/dashboard/timeseries-chart";
import { AddMovementButton } from "@/components/movement-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [preset, setPreset] = useState<RangePreset>("all");
  const range = getRange(preset);

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select
            value={preset}
            onValueChange={(v) => setPreset(v as RangePreset)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRESET_LABELS) as RangePreset[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PRESET_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddMovementButton />
        </div>
        <KpiCards range={range} />
        <TimeseriesChart range={range} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryDonut range={range} />
          <MonthlyBars range={range} />
        </div>
        <RecentMovements />
      </main>
    </>
  );
}
