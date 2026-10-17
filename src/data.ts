export type Pillar = 'focus' | 'gym' | 'diet' | 'routine' | 'health'

export const PILLARS: Record<Pillar, { label: string; weight: number; color: string; icon: string }> = {
  focus: { label: 'Focus', weight: 30, color: '#7DD3FC', icon: '🧠' },
  gym: { label: 'Gym', weight: 20, color: '#F87171', icon: '🏋️' },
  diet: { label: 'Diet', weight: 20, color: '#34D399', icon: '🥗' },
  routine: { label: 'Routine', weight: 20, color: '#C4B5FD', icon: '⏰' },
  health: { label: 'Health', weight: 10, color: '#FBBF24', icon: '❤️' },
}

export interface Habit { id: string; pillar: Pillar; title: string; time?: string; xp: number }

// SAMPLE DATA - replaced when you tap "Start fresh" in Progress > Settings
export const HABITS: Habit[] = [
  { id: 'h1', pillar: 'health', title: 'Warm water + Vitamin D', time: '06:00', xp: 10 },
  { id: 'h5', pillar: 'health', title: 'Weigh in after waking', time: '06:05', xp: 10 },
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
]
export const START_DONE = ['h1', 'h5', 'h2', 'g1', 'd1', 'f1', 'd2']

export const ARC_TOTAL = 90
export const LEVELS = ['Frostbite', 'Iron', 'Steel', 'Titan', 'Winter King']

/* ---------- health / weight loss ---------- */
export const HEALTH_GOALS = { steps: 8000, sleep: 7.5 }
export const WL_DEFAULT = { target: 72, rate: 0.5, height: 175, age: 27, sex: 'm', activity: 1.375 }
export interface WeightEntry { id: string; date: string; kg: number; waist?: number }

/* ---------- diet ---------- */
export interface Meal { id: string; slot: string; name: string; kcal: number; protein: number; fat: number; sugar: number }
export const MEALS: Meal[] = [
  { id: 'm1', slot: 'Breakfast', name: '3-egg omelette, oats, black chai', kcal: 520, protein: 32, fat: 22, sugar: 4 },
  { id: 'm2', slot: 'Lunch', name: 'Chicken daal, 2 roti, salad', kcal: 690, protein: 44, fat: 20, sugar: 6 },
  { id: 'm3', slot: 'Snack', name: 'Dahi, banana, almonds', kcal: 310, protein: 16, fat: 12, sugar: 22 },
  { id: 'm4', slot: 'Dinner', name: 'Grilled chicken tikka, sabzi, raita', kcal: 610, protein: 46, fat: 24, sugar: 5 },
]
export const GOALS = { kcal: 2300, protein: 140, fat: 70, sugar: 40 }
export const SLOTS = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other']
export const CHAI_DEFAULT = { kind: 'Chai', spoons: 1, goal: 3 }

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
