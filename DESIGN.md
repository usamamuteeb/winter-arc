# WINTER ARC — Tracker System (final design v1)

Goal: one animated, installable app that runs Usama's 90-day winter arc (Health, Diet, Routine, Gym, Data Engineering work) and makes skipping harder than doing.
Arc dates: Oct 1 -> Dec 29, 2026 (90 days). Editable at setup.

## 1. Principles
- Open the app, see exactly what to do next in under 2 seconds. One screen, one score.
- Never miss twice: a missed day is a warning, two in a row breaks the streak.
- Reward the boring: XP, streaks, and animation on every completed action.
- Local-first, works offline, no account, data stays on the phone/PC. Export/import JSON.

## 2. The five pillars and daily score (0-100)
| Pillar | Weight | What counts |
|---|---|---|
| Focus / Data Engineering | 30 | 2 deep-work blocks (90 min each), 1 learning task, 1 portfolio/job task |
| Gym | 20 | Planned workout done + logged (or planned rest day = full points) |
| Diet | 20 | Protein target, 3 planned meals, no junk/sugary drinks, water goal |
| Routine | 20 | Wake on time, sleep on time, morning ritual, evening shutdown, phone-off window |
| Health | 10 | 8k steps or 20 min sunlight walk, water, stretch/mobility, sleep >= 7h |
Day grade: S (95+), A (80+), B (65+), C (50+), F (<50). "Win day" = 70+.

## 3. Screens
1. **Today (home)**: big animated score ring (fills per completed item), day X/90 counter, streak flame, next-action card, 5 pillar mini-rings, quick-check list. Frost background with slow snow particles.
2. **Routine**: timeline of the day (editable template). Tap to check; current block highlighted with a moving "now" line. Morning / Deep-work / Evening / Sleep blocks.
3. **Gym**: split plan (default Push/Pull/Legs/Upper/Lower/Rest, editable). Workout mode: exercise list, set-by-set logging (weight x reps), auto rest timer with ring, PR detection with confetti, weekly volume chart, body-weight + measurements log.
4. **Diet**: meal plan cards (breakfast, lunch, snack, dinner), protein and calorie bars, animated water bottle that fills per glass, "junk-free" toggle, weekly weight trend. Pakistani-friendly presets (daal, chicken karahi lite, roti count, eggs, dahi, chana).
5. **Focus (Data Engineering)**: Pomodoro/deep-work timer (90/20 and 25/5 modes) with distraction-free full screen, session log, task list, and the **DE Skill Tree** (see section 5). Job-application counter (target 5/week).
6. **Progress**: GitHub-style 90-day heatmap, weekly score line chart, pillar radar chart, best streak, XP/level, weekly review.
7. **Arc Map**: 90-day path drawn like a mountain trail with 6 checkpoints and 3 "boss weeks"; unlocked days glow, missed days show a cracked ice tile.
8. **Weekly Review (Sunday night)**: auto summary (avg score, best/worst pillar), 3 prompts (what worked, what to cut, next week's one focus), next week plan preview.
9. **Settings**: arc dates, wake/sleep targets, protein/water/steps targets, gym split, notification times, theme, export/import, reset.

## 4. Game layer
- XP per action (workout 40, deep-work block 30, meals 10 each, water 5, sleep on time 20, etc). Perfect day +50.
- Levels every 500 XP: Frostbite -> Iron -> Steel -> Titan -> Winter King.
- Streak with 1 "freeze token" earned every 7 win-days (max 2). Missing twice in a row resets.
- Weekly badges (Gym x5, 4 focus days, Protein week, Early riser) and 90-day final trophy screen.
- Optional penalty pledge: user-defined forfeit shown on failed weeks (self-imposed, no real money).

## 5. Data Engineering track (12 weekly themes, ties to Databricks job search)
1 SQL basics/joins -> 2 Window functions + CTEs -> 3 Python for DE -> 4 PySpark DataFrames -> 5 Spark performance/partitioning -> 6 Delta Lake -> 7 Databricks workflows + Unity Catalog -> 8 Azure (ADF, Storage, Key Vault, Synapse) -> 9 Terraform + CI/CD -> 10 Medallion pipeline portfolio project (ingest -> bronze -> silver -> gold) -> 11 Project polish, README, demo video -> 12 Interviews + applications sprint.
Each week = a node in the skill tree with 5 checkable tasks and 1 mini-project. Each week ends with a "boss" task (small deliverable pushed to GitHub).

## 6. Default day template (editable; sample for a workday)
- 05:45 wake, water, 10 min sunlight/walk, mobility
- 06:30 gym (or 07:00 if evening gym preferred)
- 08:00 breakfast (protein first), shower
- 09:00-10:30 Deep work 1 (DE study)
- work hours = actual job, tracked as one block
- 13:30 lunch + 15 min walk
- 18:00-19:30 Deep work 2 (project/portfolio) or gym
- 20:00 dinner (no heavy carbs after)
- 21:30 phone-off window, plan tomorrow (3 priorities), read
- 22:30 sleep
Winter tweaks: warm-up longer in cold, hot water + vitamin D reminder, indoor walking fallback, early sunset reminder to take the walk before 4:30pm.

## 7. Visual design
- Theme "Frost": background #0B1220 -> #111B33 gradient, ice-blue #7DD3FC and cyan #22D3EE accents, streak amber #F59E0B, success #34D399, danger #F87171, glass cards (blur + 1px translucent border). Light mode optional.
- Type: Space Grotesk (headings, numbers), Inter (body). Big tabular numbers.
- Motion (Framer Motion): ring fill easing with overshoot, count-up numbers, checkbox morph + haptic tick, confetti burst on perfect day/PR/level-up, flame flicker, water-fill wave, page shared-element transitions, heatmap cells reveal in a wave, subtle parallax snow. Respect "reduce motion".
- Sounds: optional soft click/chime, off by default.

## 8. Tech stack (decided)
- React + Vite + TypeScript, Tailwind, Framer Motion, Zustand (state), Dexie (IndexedDB storage), Recharts (charts), date-fns.
- PWA: installable on phone and desktop, offline, service worker, local notifications for reminders.
- No backend in v1. Backup = JSON export; optional later sync via a small FastAPI/SQLite endpoint on the Neural machine.
- Neural integration (optional, v2): Neural automations send phone alerts (morning kickoff, gym reminder, evening check-in "you're at 60 today"), and a weekly review summary via notification.

## 9. Data model (IndexedDB tables)
- settings(key, value)
- days(date, score, grade, pillarScores, notes, mood, energy, sleepHours, weight)
- habits(id, pillar, title, weight, schedule, target)
- habitLogs(date, habitId, done, value)
- workouts(id, date, split, durationMin) ; sets(workoutId, exercise, setNo, weight, reps, rpe) ; exercises(id, name, muscle)
- meals(date, slot, title, protein, calories, junkFree) ; water(date, glasses)
- focusSessions(id, date, minutes, task, pillarTag)
- skillNodes(id, week, title, tasks[], done) ; jobApps(date, company, role, link, status)
- xpLog(date, action, xp) ; badges(id, earnedAt)

## 10. Build plan
1. MVP (weekend): setup wizard, Today screen with score ring, habit checklist, streak, XP, heatmap, local storage, PWA shell.
2. Gym + Diet: workout logger with rest timer and PRs, meals/protein/water, weight log.
3. Focus + DE track: deep-work timer, session log, skill tree, job-application counter.
4. Polish: Arc Map, weekly review, badges/levels, full animation pass, sounds, notifications, dark/light.
5. v2: Neural reminders + optional sync, shareable weekly report image.
Acceptance: install on phone, complete a whole day in under 60 seconds of tapping, works with airplane mode, 60fps animations on a mid phone.

## 11. Open choices (defaults already picked)
- Platform: PWA (phone + PC). Alternative: React Native app (slower to build, only worth it for native widgets).
- Gym split default: PPL + upper/lower. Change in settings.
- Religious/prayer habit: optional custom habit, not hardcoded.
