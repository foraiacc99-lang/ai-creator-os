# AI Creator OS - Project Guidelines & Rules

## 1. Project Identity & Repository
* **Project Name**: AI Creator OS
* **Primary Repository**: [https://github.com/foraiacc99-lang/ai-creator-os](https://github.com/foraiacc99-lang/ai-creator-os)
* **Author / Git Owner**: `foraiacc99-lang` (`foraiacc.99@gmail.com`)

---

## 2. Strict Project Boundaries & Isolation Rules
* **Strict Memory Isolation**: Do NOT use, reference, link, or switch to `landkml` or `landkml1027-hub` in this workspace under any circumstances, unless the user explicitly specifies the word "landkml" in their prompt.
* **Repository Actions Policy**: Always ask the user for explicit confirmation before creating, deleting, or switching Git remotes or GitHub repositories. Never automatically switch accounts or create remote repositories without direct instruction.
* **Clean Code & Credentials**: Keep all production secrets, API tokens, and local config in `.env.local` (never committed). Maintain strict SSRF protection and secure OAuth flows.

---

## 3. Technology Architecture
* **Frontend**: Next.js 16.4.3 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts.
* **Design Philosophy**: Minimalist, clean, high-contrast, modern rounded geometry (`rounded-xl` / `rounded-2xl`), frosted glass headers, and subtle hairline borders.
* **AI Layer**: Local-first inference via Ollama (`http://localhost:11434`) with zero token cost; optional cloud fallback (Groq, OpenRouter).
* **Studio Modules**:
  * AI Strategist (`/strategist`)
  * Content Ideas Library (`/ideas`)
  * Script Studio (`/scripts`)
  * X Studio (`/x`)
  * LinkedIn Studio (`/linkedin`)
  * Carousel & Stories Studio (`/carousel`)
  * Competitor Research (`/competitor`)
  * Content Calendar (`/calendar`)
  * Growth Tracker (`/analytics`)
  * Reports & Lessons (`/reports`)

