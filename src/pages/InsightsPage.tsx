import { useMoodTracker, type Mood } from "@/hooks/use-mood-tracker";
import { BarChart3, Heart, Brain, Wind, Sun, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const moodColors: Record<Mood, string> = {
  happy: "#22c55e",
  neutral: "#6b7280",
  stressed: "#f59e0b",
  anxious: "#f97316",
  sad: "#ef4444",
};

const moodValues: Record<Mood, number> = {
  happy: 5, neutral: 3, stressed: 2, anxious: 2, sad: 1,
};

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function getMoodSuggestions(weekly: Record<Mood, number>): Suggestion[] {
  const total = Object.values(weekly).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const suggestions: Suggestion[] = [];
  const dominantMood = (Object.entries(weekly) as [Mood, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // Always include a general wellness suggestion
  suggestions.push({
    icon: <Sun className="w-5 h-5 text-amber-400" />,
    title: "Daily sunlight exposure",
    description: "Spend 10–15 minutes outdoors in natural light each morning. This helps regulate your circadian rhythm and boosts serotonin levels.",
  });

  if (weekly.sad > 0 && weekly.sad >= total * 0.2) {
    suggestions.push({
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      title: "Practice gratitude journaling",
      description: "Write down three things you're grateful for each evening. Research shows this can shift focus from negative thought patterns over time.",
    });
    suggestions.push({
      icon: <MessageCircle className="w-5 h-5 text-sky-400" />,
      title: "Reach out to someone you trust",
      description: "Social connection is one of the strongest buffers against low mood. A brief call or message to a friend can make a real difference.",
    });
  }

  if (weekly.anxious > 0 && weekly.anxious >= total * 0.2) {
    suggestions.push({
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      title: "Try box breathing",
      description: "Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4–6 cycles. This activates your parasympathetic nervous system and reduces anxiety.",
    });
    suggestions.push({
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "Limit information overload",
      description: "Set specific times to check news and social media. Constant scrolling can amplify anxious feelings significantly.",
    });
  }

  if (weekly.stressed > 0 && weekly.stressed >= total * 0.2) {
    suggestions.push({
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "Progressive muscle relaxation",
      description: "Tense each muscle group for 5 seconds, then release for 30 seconds. Work from your toes upward. This reduces physical tension from stress.",
    });
    suggestions.push({
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      title: "Take movement breaks",
      description: "Every 90 minutes, stand and stretch or walk for 5 minutes. Brief movement resets cortisol levels and improves focus.",
    });
  }

  if (weekly.happy > 0 && weekly.happy >= total * 0.3) {
    suggestions.push({
      icon: <Heart className="w-5 h-5 text-emerald-400" />,
      title: "Keep doing what works",
      description: "You've had a good week emotionally. Reflect on what contributed to your positive mood and try to maintain those habits.",
    });
  }

  if (dominantMood === "neutral" && weekly.neutral >= total * 0.5) {
    suggestions.push({
      icon: <MessageCircle className="w-5 h-5 text-sky-400" />,
      title: "Explore a new activity",
      description: "A predominantly neutral mood can sometimes signal routine. Trying something new — a walk in a different place, a creative hobby — can spark positive emotions.",
    });
  }

  return suggestions.slice(0, 4);
}

export default function InsightsPage() {
  const { getWeeklySummary, getLast30Days, moodHistory } = useMoodTracker();
  const weekly = getWeeklySummary();
  const last30 = getLast30Days();
  const suggestions = getMoodSuggestions(weekly);

  const weeklyData = Object.entries(weekly).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
    fill: moodColors[mood as Mood],
  }));

  const dateMap: Record<string, { moods: Mood[] }> = {};
  last30.forEach((e) => {
    if (!dateMap[e.date]) dateMap[e.date] = { moods: [] };
    dateMap[e.date].moods.push(e.mood);
  });

  const timelineData = Object.entries(dateMap).map(([date, { moods }]) => {
    const avg = moods.reduce((s, m) => s + moodValues[m], 0) / moods.length;
    return { date: date.slice(5), score: Math.round(avg * 10) / 10 };
  });

  const totalEntries = moodHistory.length;

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="gradient-text">Mood</span> Insights
          </h1>
          <p className="text-muted-foreground text-sm">
            {totalEntries > 0
              ? `Based on ${totalEntries} mood entries`
              : "Start chatting with MindSync to track your moods"}
          </p>
        </motion.div>

        {totalEntries === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary/30" />
            <h3 className="font-display text-lg font-semibold mb-2">No data yet</h3>
            <p className="text-muted-foreground text-sm">
              Chat with MindSync to automatically track your emotional patterns.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Weekly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-display text-lg font-semibold mb-4">Weekly Summary</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="mood" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 8%)",
                      border: "1px solid hsl(0 0% 15%)",
                      borderRadius: "12px",
                      color: "hsl(0 0% 92%)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="hsl(0 72% 51%)" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Mood Timeline */}
            {timelineData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="font-display text-lg font-semibold mb-1">Mood Timeline</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Score: 1 (sad) → 5 (happy)
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timelineData}>
                    <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0 0% 8%)",
                        border: "1px solid hsl(0 0% 15%)",
                        borderRadius: "12px",
                        color: "hsl(0 0% 92%)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(0 72% 51%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(0 72% 51%)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Mental Health Suggestions */}
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="font-display text-lg font-semibold mb-1">Suggestions for You</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Personalized tips based on your recent mood patterns
                </p>
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex gap-4 p-4 rounded-xl bg-secondary/30"
                    >
                      <div className="shrink-0 mt-0.5">{s.icon}</div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{s.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mood Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-display text-lg font-semibold mb-4">Mood Guide</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(moodColors).map(([mood, color]) => (
                  <div key={mood} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-muted-foreground capitalize">{mood}</span>
                    <span className="text-xs text-muted-foreground/50">({weekly[mood as Mood]})</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
