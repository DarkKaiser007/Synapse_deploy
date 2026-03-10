interface StudyDay {
  date: string;
  subjects: string[];
}

interface StudyPlanProps {
  plan: StudyDay[];
}

export default function StudyPlan({ plan }: StudyPlanProps) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Your Study Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.map((day, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              {day.date}
            </h3>

            <ul className="space-y-2">
              {day.subjects.map((subject, i) => (
                <li
                  key={i}
                  className="bg-white/10 px-3 py-2 rounded-lg text-gray-200"
                >
                  {subject}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
