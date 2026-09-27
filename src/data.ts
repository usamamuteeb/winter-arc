export type Pillar = 'focus' | 'gym' | 'diet' | 'routine' | 'health'

export const PILLARS: Record<Pillar, { label: string; weight: number; color: string; icon: string }> = {
  focus: { label: 'Focus', weight: 30, color: '#7DD3FC', icon: '🧠' },
  gym: { label: 'Gym', weight: 20, color: '#F87171', icon: '🏋️' },
  diet: { label: 'Diet', weight: 20, color: '#34D399', icon: '🥗' },
  routine: { label: 'Routine', weight: 20, color: '#C4B5FD', icon: '⏰' },
  health: { label: 'Health', weight: 10, color: '#FBBF24', icon: '❤️' },
}

export interface Habit { id: string; pillar: Pillar; title: string; time?: string; xp: number }

// SAMPLE DATA - the real routine gets set up later
export const HABITS: Habit[] = [
  { id: 'r1', pillar: 'routine', title: 'Wake up at 5:45 AM', time: '05:45', xp: 20 },
  { id: 'h1', pillar: 'health', title: 'Warm water + Vitamin D', time: '06:00', xp: 10 },
  { id: 'h2', pillar: 'health', title: '15 min sunlight walk', time: '06:10', xp: 15 },
  { id: 'g1', pillar: 'gym', title: 'Went to the gym', time: '06:45', xp: 40 },
  { id: 'd1', pillar: 'diet', title: 'High-protein breakfast (eggs + oats)', time: '08:15', xp: 10 },
  { id: 'f1', pillar: 'focus', title: 'Deep work #1: PySpark DataFrames', time: '09:00', xp: 30 },
  { id: 'f2', pillar: 'focus', title: 'Solve 2 SQL window-function problems', time: '13:45', xp: 15 },
  { id: 'd2', pillar: 'diet', title: 'Lunch: chicken daal + 2 roti', time: '13:30', xp: 10 },
  { id: 'f3', pillar: 'focus', title: 'Deep work #2: Medallion pipeline project', time: '18:00', xp: 30 },
  { id: 'f4', pillar: 'focus', title: 'Learn 1 new concept in the Learn tab', time: '19:30', xp: 15 },
  { id: 'd3', pillar: 'diet', title: 'Sugar under my limit today', time: 'All day', xp: 15 },
  { id: 'h3', pillar: 'health', title: '8,000 steps', time: 'All day', xp: 15 },
  { id: 'h4', pillar: 'health', title: 'Stretch 10 min', time: '21:00', xp: 10 },
  { id: 'r2', pillar: 'routine', title: 'Phone off at 9:30 PM', time: '21:30', xp: 15 },
  { id: 'r3', pillar: 'routine', title: "Plan tomorrow's 3 priorities", time: '21:40', xp: 10 },
  { id: 'r4', pillar: 'routine', title: 'Sleep by 10:30 PM', time: '22:30', xp: 20 },
]
export const START_DONE = ['r1', 'h1', 'h2', 'g1', 'd1', 'f1', 'd2']

export const ARC_DAY = 12
export const ARC_TOTAL = 90
export const STREAK = 11
export const XP_TOTAL = 1380
export const LEVELS = ['Frostbite', 'Iron', 'Steel', 'Titan', 'Winter King']

/* ---------- health ---------- */
export const GYM_WEEK_BEFORE_TODAY = [true, true, false, true, true, true] // Mon..Sat sample
export const STEP_GOAL = 8000
export const SLEEP_GOAL = 7.5
export const WEIGHTS = [
  { d: 'Sep 15', kg: 79.6 }, { d: 'Sep 18', kg: 79.1 }, { d: 'Sep 21', kg: 78.8 }, { d: 'Sep 24', kg: 78.3 }, { d: 'Sep 26', kg: 78.0 },
]

/* ---------- diet ---------- */
export interface Meal { id: string; slot: string; name: string; kcal: number; protein: number; fat: number; sugar: number; eaten: boolean }
export const MEALS: Meal[] = [
  { id: 'm1', slot: 'Breakfast', name: '3-egg omelette, oats, black chai', kcal: 520, protein: 32, fat: 22, sugar: 4, eaten: true },
  { id: 'm2', slot: 'Lunch', name: 'Chicken daal, 2 roti, salad', kcal: 690, protein: 44, fat: 20, sugar: 6, eaten: true },
  { id: 'm3', slot: 'Snack', name: 'Dahi, banana, almonds', kcal: 310, protein: 16, fat: 12, sugar: 22, eaten: false },
  { id: 'm4', slot: 'Dinner', name: 'Grilled chicken tikka, sabzi, raita', kcal: 610, protein: 46, fat: 24, sugar: 5, eaten: false },
]
export const GOALS = { kcal: 2300, protein: 140, fat: 70, sugar: 40 }
export const SLOTS = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other']

/* ---------- learning roadmap ---------- */
export interface Task { id: string; title: string; done: boolean }
export interface Topic { id: string; title: string; tasks: Task[] }
const T = (title: string, done = false): Task => ({ id: Math.random().toString(36).slice(2, 9), title, done })
export const ROADMAP: Topic[] = [
  { id: 'w1', title: 'SQL for Data Engineers', tasks: [T('Joins: inner, left, anti, semi', true), T('Window functions: row_number, lag, running total', true), T('CTEs and subqueries', true), T('Read a query plan', true), T('Practice: 20 problems on DataLemur / LeetCode', true)] },
  { id: 'w2', title: 'Warehouse & Modeling Concepts', tasks: [T('OLTP vs OLAP, warehouse vs lake vs lakehouse', true), T('Star schema: fact vs dimension tables', true), T('Slowly Changing Dimensions (SCD 1, 2)', true), T('Medallion architecture: bronze / silver / gold', false), T('Design a star schema for an online store', false)] },
  { id: 'w3', title: 'Data Movement Scenarios', tasks: [T('Batch vs streaming: when to use which', true), T('Full vs incremental load, watermarks', false), T('CDC: capturing inserts, updates and deletes', false), T('Draw the flow for all 9 scenarios in Learn', false), T('Build an ADF pipeline: SQL to ADLS', false)] },
  { id: 'w4', title: 'PySpark Fundamentals', tasks: [T('Session, read/write CSV, Parquet', true), T('select, filter, withColumn, when', true), T('groupBy, agg, joins', true), T('Window functions in PySpark', false), T('Mini-project: clean NYC taxi data', false)] },
  { id: 'w5', title: 'PySpark Performance', tasks: [T('Transformations vs actions, lazy evaluation'), T('Shuffle, repartition vs coalesce'), T('Broadcast joins and data skew'), T('cache / persist and explain()'), T('Fix a slow job: small files problem')] },
  { id: 'w6', title: 'Delta Lake & Lakehouse', tasks: [T('Delta transaction log and ACID'), T('MERGE INTO (upserts) and SCD2 in Delta'), T('Time travel, VACUUM, OPTIMIZE, Z-order'), T('Auto Loader + schema evolution'), T('Structured Streaming into a Delta table')] },
  { id: 'w7', title: 'Azure & Databricks Services', tasks: [T('ADLS Gen2, folders and access control'), T('Azure Data Factory: pipelines, triggers, IR'), T('Databricks Workflows and job clusters'), T('Unity Catalog and Key Vault secrets'), T('Terraform + CI/CD basics')] },
  { id: 'w8', title: 'Capstone: Medallion Pipeline', tasks: [T('Ingest raw data to bronze'), T('Clean and dedupe to silver'), T('Build gold tables + a dashboard'), T('Add data quality checks and alerts'), T('README, diagram and demo video on GitHub')] },
]

/* ---------- progress sample ---------- */
const seed = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x) }
export const DAY_SCORES: (number | null)[] = Array.from({ length: ARC_TOTAL }, (_, i) => {
  if (i >= ARC_DAY) return null
  if (i === ARC_DAY - 1) return 0
  return Math.round(52 + seed(i + 3) * 46)
})
export const WEEK_SCORES = [64, 72, 81, 78, 88, 91]
export const PILLAR_AVG: Record<Pillar, number> = { focus: 82, gym: 88, diet: 71, routine: 76, health: 64 }
