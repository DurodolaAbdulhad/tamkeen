// Google Gemini AI — free tier (1M tokens/month)
// Used for: contextualized reminders + goal milestone suggestions

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

const callGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null

  const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    }),
  })
  const json = await res.json()
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

// Generate a daily encouragement message based on wajibaat completion
export const getDailyEncouragement = async (completionStats, userName) => {
  const { completed, total, streak, missedItems } = completionStats
  const pct = Math.round((completed / total) * 100)

  const prompt = `You are a warm, knowledgeable Islamic mentor. Write a brief (2-3 sentences) encouraging message in English for ${userName || 'a Muslim'} who completed ${completed}/${total} (${pct}%) of their daily Islamic practices today. Their current streak is ${streak} days.${missedItems?.length ? ` They missed: ${missedItems.join(', ')}.` : ' They completed everything!'} Include a relevant Quranic or hadith reference. Be warm, not preachy. End with "Barakallahu feek".`

  return callGemini(prompt)
}

// Generate goal milestones using SMART/OKR framework
export const generateGoalMilestones = async (goal) => {
  const prompt = `You are a life coach specializing in Islamic personal development. Given this goal:
Category: ${goal.category}
Title: ${goal.goal_title}
Objective: ${goal.objective}
Timeline: ${goal.timeline_start} to ${goal.timeline_end}

Generate 4 specific, measurable milestones as a JSON array. Each milestone: { "milestone": "string", "week": number, "metric": "string" }. Milestones should build progressively toward the objective. Return ONLY valid JSON, no other text.`

  const result = await callGemini(prompt)
  if (!result) return getDefaultMilestones(goal)

  try {
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return getDefaultMilestones(goal)
  }
}

// Generate a contextualized reminder based on missed items
export const getContextualReminder = async (missedItem, streakDays) => {
  const reminders = {
    tahajjud: `The Prophet ﷺ said: "In the night there is an hour in which a Muslim does not pray and ask Allah for good in this world or the next, except that He gives it to him — and this applies every night." (Muslim). You've maintained ${streakDays} days strong — tonight, rise for Tahajjud.`,
    quran:    `Ibn Mas'ud (RA) reported: "This Quran is the feast of Allah. Learn from His feast as much as you can." One juz a day keeps the heart alive. You have ${streakDays} days in your streak — don't break it tonight.`,
    duha:     `The Prophet ﷺ said: "Charity is due on every joint of a person every day the sun rises: to judge justly between two people is a charity. The two rak'ahs of Duha prayer fulfils this." (Bukhari). A few minutes, enormous reward.`,
    adhkar:   `Morning and evening adhkar are your shield. The Prophet ﷺ said: "Whoever says in the morning 'SubhanAllah wa bihamdihi' 100 times... his sins will be wiped away even if they are like the foam of the sea." (Bukhari). Your ${streakDays}-day streak is worth protecting.`,
    fasting:  `The Prophet ﷺ would say: "Whoever fasts Ramadan then follows it with six from Shawwal — it is as if he fasted the entire year." Every voluntary fast is a step closer to Allah.`,
  }

  return reminders[missedItem] || `You have ${streakDays} days in your streak. Stay consistent — consistency is more beloved to Allah than intensity. Keep going.`
}

// Fallback milestones if AI fails
const getDefaultMilestones = (goal) => [
  { milestone: 'Define your starting baseline', week: 1, metric: 'Baseline measured' },
  { milestone: 'Complete 25% of your objective', week: 2, metric: '25% done' },
  { milestone: 'Reach the halfway point', week: 4, metric: '50% done' },
  { milestone: 'Complete your full objective', week: 8, metric: '100% done' },
]
