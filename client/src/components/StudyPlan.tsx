import { useState, useEffect } from "react";
import type { StudyDay } from "../pages/StudyPlanner";

interface ColorEntry {
  bg: string;
  border: string;
  text: string;
}

interface StudyPlanProps {
  plan: StudyDay[];
  colorMap: Record<string, ColorEntry>;
}

const STORAGE_KEY = "synapse_study_plan_done";

function loadDoneMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDoneMap(map: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function makeKey(date: string, subject: string): string {
  return `${date}::${subject}`;
}

export default function StudyPlan({ plan, colorMap }: StudyPlanProps) {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(loadDoneMap);

  useEffect(() => {
    saveDoneMap(doneMap);
  }, [doneMap]);

  if (!plan || plan.length === 0) return null;

  const toggleDone = (date: string, subject: string) => {
    const key = makeKey(date, subject);
    setDoneMap((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = true;
      }
      return updated;
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    return { weekday, display: `${month} ${day}` };
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Your Study Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plan.map((day, index) => {
          const { weekday, display } = formatDate(day.date);
          const totalHours = day.slots.reduce((sum, s) => sum + s.hours, 0);
          const completedCount = day.slots.filter(
            (s) => doneMap[makeKey(day.date, s.subject)]
          ).length;

          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">
                    {display}
                  </h3>
                  <span className="text-xs text-gray-500">{weekday}</span>
                </div>
                <div className="flex items-center gap-2">
                  {completedCount === day.slots.length && day.slots.length > 0 && (
                    <span className="text-xs text-green-400">✓ Done</span>
                  )}
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                    {totalHours.toFixed(1)}h total
                  </span>
                </div>
              </div>

              <ul className="space-y-2">
                {day.slots.map((slot, i) => {
                  const color = colorMap[slot.subject];
                  const isDone = !!doneMap[makeKey(day.date, slot.subject)];
                  return (
                    <li
                      key={i}
                      className="px-3 py-2 rounded-lg flex items-center gap-3 cursor-pointer transition-opacity"
                      style={{
                        backgroundColor: color?.bg || "rgba(255,255,255,0.1)",
                        borderLeft: `3px solid ${color?.border || "rgba(255,255,255,0.3)"}`,
                        opacity: isDone ? 0.5 : 1,
                      }}
                      onClick={() => toggleDone(day.date, slot.subject)}
                    >
                      {/* Checkbox bullet */}
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: isDone
                            ? (color?.border || "#10b981")
                            : "rgba(255,255,255,0.3)",
                          backgroundColor: isDone
                            ? (color?.border || "#10b981")
                            : "transparent",
                        }}
                      >
                        {isDone && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5L4 7L8 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>

                      <span
                        className="font-medium text-sm flex-1"
                        style={{
                          color: color?.text || "#e2e8f0",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {slot.subject}
                      </span>
                      <span className="text-xs text-gray-400">
                        {slot.hours.toFixed(1)}h
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
