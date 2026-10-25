"use client";

import { useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { GlassCard } from "@/components/GlassCard";
import { PERCENT_PRESETS, SIZE_PRESETS } from "@/lib/presets";

const percentOptions = PERCENT_PRESETS.map((p) => ({ value: p, label: `${p}%` }));
const sizeOptions = SIZE_PRESETS.map((s) => ({ value: s, label: s }));

export function StylePreview() {
  const [size, setSize] = useState<string | null>("M");
  const [sugar, setSugar] = useState<number | null>(50);
  const [ice, setIce] = useState<number | null>(null);

  return (
    <>
      <GlassCard className="flex flex-col gap-6">
        <ChipGroup label="Size" name="size" options={sizeOptions} value={size} onChange={setSize} />
        <ChipGroup label="Sugar" name="sugar" options={percentOptions} value={sugar} onChange={setSugar} />
        <ChipGroup label="Ice" name="ice" options={percentOptions} value={ice} onChange={setIce} />
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-ink-muted">Your order</p>
        <p className="text-xl font-semibold">
          {size ?? "No size"}, {sugar ?? "?"}% sugar, {ice === null ? "ice not picked" : `${ice}% ice`}
        </p>
      </GlassCard>
    </>
  );
}
