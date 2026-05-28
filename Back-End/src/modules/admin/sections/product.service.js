 
import { query } from "../../../config/db.js";

const MODEL_PRICING = {
  "deepseek-chat":     { label: "DeepSeek V3 (actual)", blended: 0.70 },
  "deepseek-reasoner": { label: "DeepSeek R1",          blended: 1.37 },
  "gpt-4o-mini":       { label: "GPT-4o Mini",          blended: 0.375 },
  "gpt-4o":            { label: "GPT-4o",               blended: 6.25 },
  "claude-haiku-4-5":  { label: "Claude Haiku 4.5",     blended: 2.40 },
  "claude-sonnet-4-5": { label: "Claude Sonnet 4.5",    blended: 9.00 },
  "gemini-2.0-flash":  { label: "Gemini 2.0 Flash",     blended: 0.25 },
};

const calcCost = (tokens, price) =>
  parseFloat(((tokens / 1_000_000) * price).toFixed(6));

export const getProductStats = async () => {
  const currentModel = "deepseek-chat";

  const [total, bySource, topDestinations, perUser, tokens] = await Promise.all([
    query(`SELECT COUNT(*) AS total_plans FROM plans`),
    query(`SELECT source, COUNT(*) AS count FROM plans GROUP BY source ORDER BY count DESC`),
    query(`SELECT location_suggestion AS destination, COUNT(*) AS count FROM plans WHERE location_suggestion IS NOT NULL GROUP BY location_suggestion ORDER BY count DESC LIMIT 10`),
    query(`SELECT ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2) AS avg_plans_per_user FROM plans`),
    query(`SELECT COALESCE(SUM(tokens_used), 0) AS total_tokens FROM plans`),
  ]);

  const totalTokens = Number(tokens.rows[0].total_tokens);

  return {
    total_plans:        Number(total.rows[0].total_plans),
    by_source:          bySource.rows,
    top_destinations:   topDestinations.rows,
    avg_plans_per_user: perUser.rows[0].avg_plans_per_user,
    total_tokens:       totalTokens,
    ai_cost: {
      current_model:   MODEL_PRICING[currentModel].label,
      total_usd:       calcCost(totalTokens, MODEL_PRICING[currentModel].blended),
      cost_comparison: Object.entries(MODEL_PRICING)
        .map(([key, m]) => ({ model: key, label: m.label, cost_usd: calcCost(totalTokens, m.blended), is_current: key === currentModel }))
        .sort((a, b) => a.cost_usd - b.cost_usd),
    },
  };
};

export const getPlansTimeline = async (days = 30) => {
  const result = await query(`
    SELECT DATE_TRUNC('day', created_at) AS date,
      COUNT(*) AS total_plans,
      COUNT(CASE WHEN source = 'ai' THEN 1 END) AS ai_plans,
      COUNT(CASE WHEN source = 'manual' THEN 1 END) AS manual_plans
    FROM plans
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);
  return result.rows;
};