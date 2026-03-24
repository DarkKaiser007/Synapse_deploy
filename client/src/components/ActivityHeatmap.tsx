import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuthStore } from "../stores/auth";

// Color scale for minutes studied
const colorScale = [
	"#2d2d2d", // 0 mins (grey)
	"#a7f3d0", // 1-30 mins (light green)
	"#34d399", // 31-60 mins (medium green)
	"#059669", // 61-120 mins (dark green)
	"#065f46", // 120+ mins (deep green)
];

// Helper to get color index
function getColorIdx(mins: number) {
	if (mins === 0) return 0;
	if (mins <= 30) return 1;
	if (mins <= 60) return 2;
	if (mins <= 120) return 3;
	return 4;
}

const TOTAL_DAYS = 52 * 7;

function hashStringToSeed(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function mulberry32(seed: number) {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function randomInt(rng: () => number, min: number, max: number) {
	return min + Math.floor(rng() * (max - min + 1));
}

function generateDays(userId: string) {
	const days: { date: string; mins: number }[] = [];
	const today = dayjs();
	const rng = mulberry32(hashStringToSeed(`heatmap-${userId}`));
	const forcedActiveDates = new Set(["2025-12-19", "2025-12-20", "2025-12-21"]);

	for (let i = 0; i < TOTAL_DAYS; i++) {
		const date = today.subtract(TOTAL_DAYS - 1 - i, "day");
		const isSunday = date.day() === 0;
		const isRecent = i >= TOTAL_DAYS - 60;

		// Baseline distribution:
		// none 62%, l1 20%, l2 10%, l3 5%, l4 3%
		// Apply slight recency increase and Sunday activity reduction.
		let activeProbability = 0.4;
		if (isRecent) activeProbability *= 1.15;
		if (isSunday) activeProbability *= 0.5;

		const level1Share = 20 / 38;
		const level2Share = 10 / 38;
		const level3Share = 5 / 38;
		const level4Share = 3 / 38;

		const p1 = activeProbability * level1Share;
		const p2 = activeProbability * level2Share;
		const p3 = activeProbability * level3Share;
		const p4 = activeProbability * level4Share;

		const roll = rng();
		let mins = 0;

		if (roll < p1) {
			mins = randomInt(rng, 1, 30);
		} else if (roll < p1 + p2) {
			mins = randomInt(rng, 31, 60);
		} else if (roll < p1 + p2 + p3) {
			mins = randomInt(rng, 61, 120);
		} else if (roll < p1 + p2 + p3 + p4) {
			mins = randomInt(rng, 121, 180);
		}

		const dateKey = date.format("YYYY-MM-DD");
		if (forcedActiveDates.has(dateKey) && mins === 0) {
			mins = randomInt(rng, 18, 52);
		}

		days.push({ date: dateKey, mins });
	}

	return days;
}

// Calculate streaks
function calcStreaks(days: { date: string; mins: number }[]) {
	let current = 0, longest = 0, total = 0;
	let streak = 0;
	for (let i = days.length - 1; i >= 0; i--) {
		if (days[i].mins > 0) {
			streak++;
			total++;
			if (streak > longest) longest = streak;
		} else {
			if (i === days.length - 1) current = streak;
			streak = 0;
		}
	}
	if (current === 0 && days[days.length - 1].mins > 0) current = streak;
	return { current, longest, total };
}

const cellSize = 14;
const cellGap = 3;

export default function ActivityHeatmap() {
	const userId = useAuthStore((state) => state.user?.id || "guest");
	const days = useMemo(() => generateDays(userId), [userId]);
	const streaks = useMemo(() => calcStreaks(days), [days]);
	const [hovered, setHovered] = useState<null | { date: string; mins: number }>(null);

	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-white mb-4">Study Activity</h2>
			<div className="flex items-center">
				<svg width={52 * (cellSize + cellGap)} height={7 * (cellSize + cellGap)}>
					{days.map((day, idx) => {
						const x = Math.floor(idx / 7);
						const y = idx % 7;
						return (
							<rect
								key={day.date}
								x={x * (cellSize + cellGap)}
								y={y * (cellSize + cellGap)}
								width={cellSize}
								height={cellSize}
								rx={3}
								fill={colorScale[getColorIdx(day.mins)]}
								className="cursor-pointer transition duration-150"
								onMouseEnter={() => setHovered(day)}
								onMouseLeave={() => setHovered(null)}
							/>
						);
					})}
				</svg>
				{/* Legend */}
				<div className="ml-8 flex items-center">
					<span className="text-gray-400 text-xs mr-2">Less</span>
					{colorScale.map((color, i) => (
						<div key={i} className="w-5 h-5 mx-1 rounded bg-white/10 flex items-center justify-center">
							<div style={{ background: color, width: 16, height: 16, borderRadius: 4 }}></div>
						</div>
					))}
					<span className="text-gray-400 text-xs ml-2">More</span>
				</div>
			</div>
			{/* Tooltip */}
			{hovered && (
				<div className="mt-2 px-4 py-2 bg-black/80 rounded shadow-lg inline-block text-white text-xs">
					<span>{hovered.date}</span> — <span>{hovered.mins} mins studied</span>
				</div>
			)}
			{/* Streak stats */}
			<div className="mt-4 flex space-x-6 text-white text-sm">
				<div>Current streak: <span className="font-bold">{streaks.current}</span> days</div>
				<div>Longest streak: <span className="font-bold">{streaks.longest}</span> days</div>
				<div>Total active days: <span className="font-bold">{streaks.total}</span></div>
			</div>
		</div>
	);
}