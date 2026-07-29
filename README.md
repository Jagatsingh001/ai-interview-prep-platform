# PrepRoom — AI Interview Preparation Platform

Phase 1 scaffold: project setup, database schema, AI wrapper, and landing page.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (dev) — swap to Postgres for production
- Anthropic API (Claude) for the AI interviewer, resume analysis, and feedback
- Web Speech API (browser-native) for voice-to-text — no extra service needed

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env and add your ANTHROPIC_API_KEY (from console.anthropic.com)

# 3. Set up the database
npm run prisma:generate
npm run prisma:migrate -- --name init

# 4. Run the dev server
npm run dev
```

Visit http://localhost:3000

## Project structure

```
prisma/schema.prisma         # DB models: User, Resume, InterviewSession, InterviewQuestion, Feedback
src/lib/prisma.ts            # DB client
src/lib/ai.ts                # Anthropic API wrapper (askClaude, askClaudeForJSON)
src/app/page.tsx             # Landing page
src/app/dashboard/           # Performance dashboard (Phase 8)
src/app/interview/           # AI mock interview UI (Phase 2 + 3)
src/app/resume/              # Resume analysis UI (Phase 4)
src/app/api/interview/       # Mock interview API route
src/app/api/resume/analyze/  # Resume analysis API route
src/app/api/feedback/        # Feedback generation API route
```

## Build roadmap

- [x] **Phase 1** — Project scaffold, DB schema, AI wrapper, landing page
- [ ] **Phase 2** — AI Mock Interviewer (adaptive Q&A engine)
- [ ] **Phase 3** — Voice-to-text integration
- [ ] **Phase 4** — Resume analysis (PDF upload + AI parsing + ATS score)
- [ ] **Phase 5** — Coding questions module
- [ ] **Phase 6** — HR interview simulation mode
- [ ] **Phase 7** — AI feedback engine (scoring + suggestions)
- [ ] **Phase 8** — Performance dashboard with charts

Each phase adds real, working code on top of this scaffold — nothing here needs to be thrown away.
