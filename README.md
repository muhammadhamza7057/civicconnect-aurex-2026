# CivicConnect — Smart City Resident Services Portal

CivicConnect is an enterprise-ready AI-powered smart city platform for managing resident complaints, permits, events, and real-time staff workflows.

This repository contains a frontend built with React + Vite and a backend Express API that uses Supabase for database and auth.

Key features:
- Resident ticket submission with uploads, map location, and SLA timers
- AI background processing (Gemini) for categorization, priority, and duplicate detection
- Real-time updates via Socket.io + Supabase Realtime
- Permits multi-step wizard with PDF generation
- Announcements & events with real-time banners
- Analytics dashboard with animated charts and heatmaps

Getting started (high-level):
1. Create a Supabase project and enable Auth, Realtime, and Storage.
2. Copy `.env.example` to `.env` and fill values.
3. Run `npm install` in both `backend` and `frontend`, then start dev servers.

See the `backend` and `frontend` folders for module-specific instructions.
