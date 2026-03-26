import { useState, useEffect, useCallback } from "react";
import ExamForm from "../components/ExamForm";
import StudyPlan from "../components/StudyPlan";
import { useAuthStore } from "../stores/auth";

interface Exam {
  id: string;
  subject: string;
  examDate: string;
  difficulty: string;
}

export interface StudySlot {
  subject: string;
  hours: number;
}

export interface StudyDay {
  date: string;
  slots: StudySlot[];
}

export interface PlanWarning {
  subject: string;
  message: string;
}

const DIFFICULTY_HOURS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const MAX_HOURS_PER_DAY = 6;

// Deterministic color palette for subjects
const SUBJECT_COLORS = [
  { bg: "rgba(99, 102, 241, 0.25)", border: "rgb(99, 102, 241)", text: "#a5b4fc" },   // indigo
  { bg: "rgba(236, 72, 153, 0.25)", border: "rgb(236, 72, 153)", text: "#f9a8d4" },   // pink
  { bg: "rgba(34, 197, 94, 0.25)",  border: "rgb(34, 197, 94)",  text: "#86efac" },    // green
  { bg: "rgba(251, 146, 60, 0.25)", border: "rgb(251, 146, 60)", text: "#fdba74" },    // orange
  { bg: "rgba(14, 165, 233, 0.25)", border: "rgb(14, 165, 233)", text: "#7dd3fc" },    // sky
  { bg: "rgba(168, 85, 247, 0.25)", border: "rgb(168, 85, 247)", text: "#c4b5fd" },    // purple
  { bg: "rgba(234, 179, 8, 0.25)",  border: "rgb(234, 179, 8)",  text: "#fde047" },    // yellow
  { bg: "rgba(244, 63, 94, 0.25)",  border: "rgb(244, 63, 94)",  text: "#fda4af" },    // rose
];

function getDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function generateStudyPlan(exams: Exam[]): { plan: StudyDay[]; warnings: PlanWarning[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const warnings: PlanWarning[] = [];

  // Filter & compute metadata per subject
  const subjects = exams
    .map((exam) => {
      const examDate = new Date(exam.examDate);
      examDate.setHours(0, 0, 0, 0);
      const dailyHours = DIFFICULTY_HOURS[exam.difficulty.toLowerCase()] ?? 2;
      const daysAvailable = Math.floor((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        name: exam.subject,
        examDate,
        difficulty: exam.difficulty.toLowerCase(),
        dailyHours,
        daysAvailable,
        totalHoursNeeded: dailyHours * Math.max(daysAvailable, 1),
        hoursAllocated: 0,
      };
    })
    .filter((s) => s.daysAvailable > 0)
    .sort((a, b) => {
      // Primary: nearest exam first
      const dateDiff = a.examDate.getTime() - b.examDate.getTime();
      if (dateDiff !== 0) return dateDiff;
      // Secondary: higher difficulty first
      return (DIFFICULTY_HOURS[b.difficulty] ?? 2) - (DIFFICULTY_HOURS[a.difficulty] ?? 2);
    });

  if (subjects.length === 0) {
    return { plan: [], warnings };
  }

  // Build calendar from today to last exam date
  const lastExamDate = new Date(Math.max(...subjects.map((s) => s.examDate.getTime())));
  const calendar: Map<string, StudySlot[]> = new Map();
  let cursor = new Date(today);

  while (cursor < lastExamDate) {
    calendar.set(getDateString(cursor), []);
    cursor = addDays(cursor, 1);
  }

  // Allocate day-by-day
  for (const [dateStr, slots] of calendar) {
    const currentDate = new Date(dateStr);
    let remainingHours = MAX_HOURS_PER_DAY;

    // Find which subjects are active on this day (exam not yet passed)
    const activeSubjects = subjects.filter((s) => currentDate < s.examDate);
    if (activeSubjects.length === 0) continue;

    // Calculate total requested hours for the day
    const totalRequested = activeSubjects.reduce((sum, s) => sum + s.dailyHours, 0);

    for (const subject of activeSubjects) {
      if (remainingHours <= 0) break;

      // Proportional: if total requested > max, scale down proportionally
      let hours: number;
      if (totalRequested <= MAX_HOURS_PER_DAY) {
        hours = subject.dailyHours;
      } else {
        hours = Math.round((subject.dailyHours / totalRequested) * MAX_HOURS_PER_DAY * 10) / 10;
      }

      hours = Math.min(hours, remainingHours);
      if (hours > 0) {
        slots.push({ subject: subject.name, hours });
        subject.hoursAllocated += hours;
        remainingHours -= hours;
      }
    }
  }

  // Check for warnings
  for (const subject of subjects) {
    const idealTotal = subject.dailyHours * subject.daysAvailable;
    if (subject.hoursAllocated < idealTotal * 0.8) {
      warnings.push({
        subject: subject.name,
        message: `Only ${subject.hoursAllocated.toFixed(1)}h allocated out of ${idealTotal}h ideal. Too many overlapping exams for the available days.`,
      });
    }
    if (subject.daysAvailable <= 2) {
      warnings.push({
        subject: subject.name,
        message: `Only ${subject.daysAvailable} day(s) before exam! Consider extending or prioritizing.`,
      });
    }
  }

  // Convert to array, filtering empty days
  const plan: StudyDay[] = [];
  for (const [date, slots] of calendar) {
    if (slots.length > 0) {
      plan.push({ date, slots });
    }
  }

  return { plan, warnings };
}

export default function StudyPlanner() {
  const [plan, setPlan] = useState<StudyDay[]>([]);
  const [warnings, setWarnings] = useState<PlanWarning[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const { user } = useAuthStore();

  // Build a stable color map for subjects
  const subjectColorMap: Record<string, typeof SUBJECT_COLORS[0]> = {};
  const uniqueSubjects = [...new Set(exams.map((e) => e.subject))];
  uniqueSubjects.forEach((name, i) => {
    subjectColorMap[name] = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
  });

  const fetchExams = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/exams?userId=${user.id}`);
    const data = await res.json();
    setExams(data);
  }, [user?.id]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Auto-regenerate plan whenever exams change
  useEffect(() => {
    if (exams.length === 0) {
      setPlan([]);
      setWarnings([]);
      return;
    }
    const result = generateStudyPlan(exams);
    setPlan(result.plan);
    setWarnings(result.warnings);
  }, [exams]);

  const deleteExam = async (id: string) => {
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 className="text-3xl font-bold text-white mb-6">Study Planner</h1>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 max-w-md">
        <ExamForm setExams={setExams} />
      </div>

      <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Exams</h2>

      <div className="space-y-3">
        {exams.map((exam) => {
          const color = subjectColorMap[exam.subject];
          return (
            <div
              key={exam.id}
              className="rounded-lg p-4 flex justify-between items-center"
              style={{
                backgroundColor: color?.bg || "rgba(255,255,255,0.05)",
                border: `1px solid ${color?.border || "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div>
                <p className="text-white font-medium">{exam.subject}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(exam.examDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <span style={{ color: color?.text || "#93c5fd" }}>{exam.difficulty}</span>

              <button
                onClick={() => deleteExam(exam.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-6 space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.15)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                color: "#fde68a",
              }}
            >
              ⚠️ <strong>{w.subject}:</strong> {w.message}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <StudyPlan plan={plan} colorMap={subjectColorMap} />
      </div>
    </div>
  );
}
