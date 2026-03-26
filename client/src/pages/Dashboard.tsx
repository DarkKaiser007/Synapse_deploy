import { BarChart3, BookOpen, Clock, Download, FileText, Play, Plus, Target, TrendingUp, Users, X } from "lucide-react";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiRequest } from "../services/api";
import StartSessionModal from "../components/StartSessionModal";
import { usePerformanceData } from "../hooks/usePerformanceData";
import { usePomodoroStore } from "../stores/pomodoro";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Dashboard() {
  const groupStudyLink = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_OTY0Nj";
  const markdownComponents = {
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-white">{children}</strong>,
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2">{children}</p>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside space-y-1 mt-2">{children}</ol>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside space-y-1 mt-2">{children}</ul>,
    li: ({ children }: { children?: React.ReactNode }) => <li className="ml-2">{children}</li>,
  };

  // TODO: Replace with actual user from auth store
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const { data: performanceData, isLoading: performanceLoading, isRevalidating } = usePerformanceData();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isGroupStudyModalOpen, setIsGroupStudyModalOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const copyResetTimerRef = useRef<number | null>(null);
  const [notesCount, setNotesCount] = useState<number | null>(null);
  const totalStudyMinutes = usePomodoroStore((s) => s.getTotalStudyMinutes());

  // Fetch notes count
  useEffect(() => {
    const fetchNotesCount = async () => {
      try {
        const notes = await apiRequest("/notes", "GET");
        if (Array.isArray(notes)) {
          setNotesCount(notes.length);
        }
      } catch {
        setNotesCount(0);
      }
    };
    fetchNotesCount();
  }, []);

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isGroupStudyModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGroupStudyModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGroupStudyModalOpen]);

  const startStudySession = () => {
    setIsStartModalOpen(true);
  };

  const actions = [
    {
      label: "Create Note",
      icon: FileText,
      angle: 90,
      onClick: () => navigate("/notes"),
    },
    {
      label: "Solo Session",
      icon: Play,
      angle: 120,
      onClick: () => startStudySession(),
    },
    {
      label: "Group Study",
      icon: Users,
      angle: 150,
      onClick: () => setIsGroupStudyModalOpen(true),
    },
    {
      label: "Take Quiz",
      icon: BookOpen,
      angle: 180,
      onClick: () => navigate("/quizzes"),
    },
  ];

  const handleCopyGroupStudyLink = async () => {
    try {
      await navigator.clipboard.writeText(groupStudyLink);
      setIsLinkCopied(true);

      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }

      copyResetTimerRef.current = window.setTimeout(() => {
        setIsLinkCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy Teams link", error);
    }
  };

  const handleDownloadGroupStudyLink = () => {
    const blob = new Blob([groupStudyLink], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "synapse_group_study.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleStartSession = async (payload: {
    subjectId: string | null;
    durationMinutes: number;
    subjectName: string;
  }) => {
    setIsStartModalOpen(false);

    try {
      await apiRequest("/sessions", "POST", {
        subjectId: payload.subjectId,
        durationMinutes: payload.durationMinutes,
        type: "MANUAL",
      });
    } catch (error) {
      console.error("Failed to log study session", error);
    }

    navigate(`/study-session?time=${payload.durationMinutes}&subject=${payload.subjectId}&subjectName=${encodeURIComponent(payload.subjectName)}`);
  };

  const radarData = (performanceData?.scoreBySubject || []).map((subject) => ({
    subject: subject.subject,
    score: subject.averageScore,
  }));

  return (
    <div className="px-6 pt-6 pb-16">
      {isFabOpen && (
        <button
          aria-label="Close action menu"
          onClick={() => setIsFabOpen(false)}
          className="fixed inset-0 z-40 bg-black/35"
        />
      )}

      {isGroupStudyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close Group Study modal"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsGroupStudyModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-blue-900/30">
            <button
              type="button"
              aria-label="Close Group Study modal"
              onClick={() => setIsGroupStudyModalOpen(false)}
              className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-12">
              <h2 className="text-2xl font-bold text-white">Group Study Room</h2>
              <p className="mt-1 text-gray-300">
                Join your study group on Microsoft Teams
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
                Microsoft Teams Link
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={groupStudyLink}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-blue-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyGroupStudyLink();
                  }}
                  className="rounded-xl border border-white/20 bg-blue-500/20 px-4 py-2.5 text-sm font-medium text-blue-200 hover:bg-blue-500/30 transition-colors"
                >
                  {isLinkCopied ? "✅ Copied!" : "Copy Link"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadGroupStudyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Link
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGroupStudyModalOpen(false)}
                className="rounded-xl border border-white/20 px-5 py-2.5 text-gray-200 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <a
                href={groupStudyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-500 hover:to-cyan-400"
              >
                Open in Teams
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-6 z-50">
        {actions.map((action, index) => {
          const radius = 110;
          const angleInRadians = (action.angle * Math.PI) / 180;
          const x = Math.cos(angleInRadians) * radius;
          const y = -Math.sin(angleInRadians) * radius;
          const Icon = action.icon;

          return (
            <div
              key={action.label}
              className="absolute top-0 right-0 flex flex-col items-center"
              style={{
                transform: isFabOpen
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : "translate(0px, 0px) scale(0.7)",
                opacity: isFabOpen ? 1 : 0,
                transitionProperty: "transform, opacity",
                transitionDuration: "260ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: isFabOpen ? `${index * 50}ms` : "0ms",
                pointerEvents: isFabOpen ? "auto" : "none",
              }}
            >
              <div className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsFabOpen(false);
                    action.onClick();
                  }}
                  className="w-12 h-12 rounded-full bg-[var(--color-primary)] hover:bg-blue-600 text-white border border-white/20 flex items-center justify-center shadow-lg transition-colors duration-200"
                >
                  <Icon className="h-5 w-5" />
                </button>
                <span
                  className="absolute px-2.5 py-1 rounded-full bg-black/80 text-xs text-gray-200 whitespace-nowrap pointer-events-none"
                  style={{
                    right: action.label === "Create Note" ? "calc(100% + 2px)" : "calc(100% + 8px)",
                    top: action.label === "Create Note" ? "calc(50% - 30px)" : "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {action.label}
                </span>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsFabOpen((prev) => !prev)}
          aria-label={isFabOpen ? "Close quick actions" : "Open quick actions"}
          className="relative p-3 rounded-full bg-[var(--color-primary)] hover:bg-blue-600 text-white border border-white/20 shadow-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Plus
            className={`h-6 w-6 transition-transform duration-300 ease-out ${
              isFabOpen ? "rotate-45" : "rotate-0"
            }`}
          />
        </button>
      </div>

      <StartSessionModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onStart={handleStartSession}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-6 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl mr-4">
                  <BookOpen className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{notesCount ?? "--"}</p>
                  <p className="text-gray-400 text-sm">Notes Created</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/20 rounded-xl mr-4">
                  <Clock className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{formatStudyTime(totalStudyMinutes)}</p>
                  <p className="text-gray-400 text-sm">Study Time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500/20 rounded-xl mr-4">
                  <Target className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{performanceData?.totalQuizzes ?? "--"}</p>
                  <p className="text-gray-400 text-sm">Quizzes Completed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-cyan-500/20 rounded-xl mr-4">
                  <TrendingUp className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {performanceData ? `${performanceData.averageScore}%` : "--"}
                  </p>
                  <p className="text-gray-400 text-sm">Average Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
            {isRevalidating && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="h-3 w-3 rounded-full border border-blue-300 border-t-transparent animate-spin" />
                Updating
              </div>
            )}
          </div>

          {performanceLoading ? (
            <>
              <div className="group relative mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur opacity-20" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-44 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-[360px] animate-pulse" />
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-[360px] animate-pulse" />
              </div>
            </>
          ) : !performanceData || performanceData.totalQuizzes === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center mb-6">
              <p className="text-gray-300">Complete some quizzes to see your analytics here</p>
            </div>
          ) : (
            <>
              <div className="group relative mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">AI Study Coach Analysis</h2>
                      <div className="text-gray-200 leading-relaxed text-lg">
                        <ReactMarkdown components={markdownComponents}>
                          {performanceData.aiAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-6">Score Trend Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData.scoreOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                        <YAxis stroke="rgba(255,255,255,0.6)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-6">Subject Performance</h2>
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                          />
                          <Radar
                            name="Score %"
                            dataKey="score"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0,0,0,0.8)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-80 text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/performance")}
              className="text-sm text-blue-300 hover:text-blue-200 hover:underline transition-colors duration-200"
            >
              View full analytics in the Performance tab →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
