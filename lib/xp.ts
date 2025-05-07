import { neon } from "@neondatabase/serverless"
import { getLevelInfo, getNextLevelInfo } from "./db"

export async function calculateLevel(totalXp: number, prestige = 0) {
  const sql = neon(process.env.DATABASE_URL!)

  const result = await sql`
    SELECT MAX(level) as level
    FROM level_thresholds
    WHERE xp_required < ${totalXp}
    AND prestige_required = ${prestige}
  `
  if(!result || result.length === 0) {
    //check next prestige
    const nextPrestige = prestige + 1
    const nextResult = await sql`
      SELECT MAX(level) as level
      FROM level_thresholds
      WHERE xp_required < ${totalXp}
      AND prestige_required = ${nextPrestige}
    `
    return (nextResult[0]?.level || 0 )
  }

  return (result[0]?.level || 0)
}

// Calcular el prestigio basado en el nivel
export function calculatePrestige(level: number) {
  return Math.floor((level - 1) / 100)
}
export async function calculateXpForNextLevel(currentLevel: number, prestige = 0) {
  const nextLevel = await getNextLevelInfo(currentLevel)
  const currentLevelInfo = await getLevelInfo(currentLevel)

  if (!nextLevel || !currentLevelInfo) {
    return { current: 0, required: 100, percentage: 0 }
  }

  const currentXpRequired = currentLevelInfo.xp_required
  const nextXpRequired = nextLevel.xp_required
  const xpForNextLevel = nextXpRequired - currentXpRequired

  return {
    current: currentXpRequired,
    required: nextXpRequired,
    total: xpForNextLevel,
  }
}

export function calculateXpPercentage(currentXp: number, requiredXp: number) {
  return Math.min(100, Math.floor((currentXp / requiredXp) * 100))
}

export function calculateRequiredXp(level: number) {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function calculateLevelFromXp(totalXp: number) {
  return Math.floor(Math.pow(totalXp / 100, 1 / 1.5))
}
