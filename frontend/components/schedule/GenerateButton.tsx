"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Schedule } from "@/types/schedule";

interface GenerateButtonProps {
  weekStartDate: string;
  onScheduleGenerated: (schedule: Schedule) => void;
}

export function GenerateButton({
  weekStartDate,
  onScheduleGenerated,
}: GenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStartDate }),
      });
      const { schedule } = await res.json();
      onScheduleGenerated(schedule);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleGenerate} loading={loading}>
      Generate Week Schedule
    </Button>
  );
}
