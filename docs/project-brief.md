# Interactive Birthday Microsite – Project Brief
**Document Version:** 1.0  
**Date:** August 14, 2025  
**Owner:** George (Entrepreneur & Developer)  
**Analyst:** Senior Digital Experience Analyst (Webby Award)  

---

## 1) Executive Summary
This initiative delivers a mobile-first, single-page **interactive birthday microsite** that fuses **personal memories** with **BTS/BT21-themed flair**, culminating in a gamified **quiz-driven gift reveal**. The experience is designed for high emotional impact, low technical complexity, and rapid time-to-value. The creative backbone, sections, and interaction model are sourced from the attached research specification [research.md](research.md).

**Business Outcomes**
- Create a memorable, bespoke birthday journey that increases emotional resonance and delight.
- Leverage interactive storytelling to guide the recipient toward a final gift reveal moment.
- Ensure a polished, performant delivery suitable for sharing on mobile devices and social channels [research.md](research.md).

**North-Star KPI(s)**
- Completion rate of the full story flow to gift reveal (target ≥ 90%).
- Positive qualitative feedback (e.g., NPS-style micro-survey post-experience), optional.
- Zero P0 defects at launch; ≤ 2 P1 issues within first 24 hours.

---

## 2) Goals, Non-Goals, and Success Criteria
**Goals**
- Ship a cohesive, **one-page** “story chapters” experience with smooth scroll transitions and interactive quiz gates [research.md](research.md).
- Embed **BTS/BT21** motifs and **purple** color accents authentically while foregrounding personal photos and moments [research.md](research.md).
- Deliver a **finale section** with heartfelt message and **gift clue** plus celebratory animation (confetti/balloons) [research.md](research.md).

**Non-Goals**
- Building a multi-page CMS or admin panel.
- Implementing server-side personalization or user accounts.
- Heavy audio/video production beyond lightweight optional music or a simple voice note [research.md](research.md).

**Measurable Success Criteria**
- Smooth section-to-section navigation without layout shift (CLS < 0.1) on modern mobile browsers.
- All quiz interactions respond within 100ms on tap.
- Images optimized; total initial payload ≤ 1.0–1.5 MB on first paint (excluding optional audio).

---

## 3) Scope
**In-Scope**
- **Structure:** Intro → Quiz Section 1 (Miracle/Butterfly Garden month) → Quiz Section 2 (Uzbekistan trip) → Quiz Section 3 (custom memory) → Finale with message & gift clue [research.md](research.md).
- **Design:** Vibrant, section-specific backgrounds; BTS/BT21 accent graphics; personal photos prominently featured; celebratory effects [research.md](research.md).
- **Interactivity:** Scroll-triggered reveals (IntersectionObserver), multiple-choice quizzes with real-time feedback and progression gating, finale animation [research.md](research.md).
- **Mobile-first Responsive CSS**, image optimization pipeline, basic analytics.

**Out-of-Scope**
- Payment, authentication, or data storage beyond basic analytics events.
- SEO/Indexing requirements (private microsite intent).

---

## 4) Target Audience & Usage Context
- **Primary Audience:** The recipient (birthday celebrant; BTS/ARMY fan). Mobile-first consumption expected.
- **Secondary Audience:** Close friends/family for sharing after the event (read-only).

**Usage Context**
- Accessed via a private URL. Expected viewing time: 3–6 minutes end-to-end.

---

## 5) Experience Architecture (Sections & Narrative)
**Single-Page Flow** (scroll/snapped “chapters”) [research.md](research.md)  
1. **Intro** — Warm greeting, BTS/BT21 cameo, “scroll down” affordance, purple-accented hero [research.md](research.md).  
2. **Memory Quiz 1: Miracle & Butterfly Garden (Dubai, 2023)** — Photos + prompt to guess **month** (options e.g., Oct/Nov/Dec). Correct answer configured via metadata validation or manual config [research.md](research.md).  
3. **Memory Quiz 2: Uzbekistan Trip** — Photos + prompt to identify **country** (correct: Uzbekistan) [research.md](research.md).  
4. **Memory Quiz 3: Custom Personal Memory** — Options: anniversary/first date/BTS preference; buttons with immediate feedback [research.md](research.md).  
5. **Finale** — Heartfelt note with **“Borahae / I Purple You”** nod; **gift clue**; celebratory **confetti** burst [research.md](research.md).

**Navigation**
- Scrolling with smooth snapping; optional “Next” CTA for clarity; progress cueing per section [research.md](research.md).

---

## 6) Content Strategy & Asset Plan
**Copy Guidelines**
- First-person, affectionate tone; concise per section; playful BTS references; clear quiz prompts and feedback copy (✔/❌) [research.md](research.md).

**Assets Needed**
- Personal photos: Miracle/Butterfly Garden, Uzbekistan, third memory (2–3 images per section).  
- BTS/BT21 graphics (ensure permissible licensing; prefer official assets or royalty-free styled analogs).  
- Icons: balloons, cake, confetti; optional subtle patterns.

**Audio (Optional)**
- Low-volume instrumental of a favorite BTS track or a short personal voice note with visible controls (no forced autoplay) [research.md](research.md).

---

## 7) Functional Requirements (FR)
**FR-1 Section Reveal & Scroll**
- Use IntersectionObserver to add/remove .in-view class for reveal animations [research.md](research.md).
- Scroll-snap or smooth scroll to land cleanly on each section.

**FR-2 Quiz Mechanics**
- Each quiz section presents 2–4 options as accessible buttons/cards.  
- On selection: display real-time validation (✔ success; ❌ retry allowed), then unlock advance to next section [research.md](research.md).  
- Config: set correct answers (Quiz1: month of Miracle/Butterfly visit; Quiz2: Uzbekistan; Quiz3: configurable) [research.md](research.md).

**FR-3 Finale Reveal**
- Trigger confetti/balloons animation on reaching finale or tapping “Reveal Gift Clue”.  
- Display heartfelt message + gift clue; ensure it’s read before navigational affordance appears [research.md](research.md).

**FR-4 Responsive Behavior**
- Layout scales from 360px width; tap targets ≥ 44px; text legibility ≥ 16px on mobile.

**FR-5 Analytics (Lightweight)**
- Track section views, quiz selections (anonymous), completion event (gift reveal).

---

## 8) Non-Functional Requirements (NFR)
- **Performance:** First contentful paint < 2.0s on 4G; lazy-load below-the-fold images; compress assets.  
- **Stability:** No console errors; degrade gracefully if JS disabled (basic linear content visible).  
- **Accessibility:** Semantic HTML, alt text for all images, focus states, ARIA for interactive components; color contrast ≥ AA.  
- **Privacy:** No PII collection; analytics anonymized; no third-party tracking pixels.

---

## 9) Design System & Motion
- **Color:** Vibrant per-section palettes with BTS purple as a connective accent; avoid harsh backgrounds behind text [research.md](research.md).  
- **Typography:** Celebratory headline font + readable body font; maintain hierarchy per section.  
- **Motion Principles:** Subtle fades/slides on entrance; optional character bounce; limit concurrent animations to avoid motion fatigue [research.md](research.md).

---

## 10) Technical Approach
- **Stack:** Vanilla HTML/CSS/JS for control and portability.  
- **Animations:** CSS transitions & keyframes; JS only for triggers and quiz logic [research.md](research.md).  
- **Bundling:** Lightweight build (e.g., Vite or no build if preferred).  
- **Hosting:** Static hosting (GitHub Pages/Netlify/Vercel).  
- **CI:** Optional pre-deploy check for Lighthouse performance budget.

---

## 11) Project Plan & Timeline (Indicative)
**T0 (Day 0–1) – Discovery & Asset Intake**  
- Confirm correct month for Quiz 1 (from photo metadata or memory).  
- Select & crop photos; confirm third-memory topic; gather BTS/BT21 graphics (licensed).

**T1 (Day 1–2) – Design & Copy Draft**  
- Section wireframes & motion storyboard; draft copy for all sections & quiz feedback.

**T2 (Day 2–3) – Build Alpha**  
- Implement sections, scroll reveals, quiz logic, finale animation.

**T3 (Day 3–4) – QA & Polish**  
- Cross-device testing; performance optimization; accessibility pass; bug bash.

**T4 (Day 5) – Launch**  
- Final review & publish to static host; smoke test on target device(s).

---

## 12) Risks & Mitigations
- **Licensing Risk (BTS/BT21 Artwork):** Use official or royalty-free lookalikes; avoid unlicensed fan art.  
- **Mobile Autoplay Restrictions:** Provide explicit play control; do not rely on autoplay audio.  
- **Image Weight & Jank:** Enforce compression and lazy-load; reserve aspect-ratio boxes to prevent CLS.  
- **Quiz Content Accuracy:** Validate answers (e.g., gift clue logic, month correctness) with owner sign-off prior to launch [research.md](research.md).

---

## 13) Acceptance Criteria (Per Section)
**Intro**  
- Heading, subcopy, and at least one BTS/BT21 accent graphic render correctly; scroll affordance visible [research.md](research.md).

**Quiz 1 – Miracle/Butterfly**  
- Displays at least one photo; presents month options (≥ 3); validates correct month; allows retry; progression gate works [research.md](research.md).

**Quiz 2 – Uzbekistan**  
- Displays travel photo(s); presents country options; validates **Uzbekistan**; progression gate works [research.md](research.md).

**Quiz 3 – Custom Memory**  
- Displays selected memory photo; renders 2–4 options; validates chosen correct answer; progression gate works [research.md](research.md).

**Finale**  
- Heartfelt message visible above the fold; **gift clue** shown only after message is revealed; confetti animation triggers on reveal; completion event tracked [research.md](research.md).

---

## 14) Deliverables
- Source code repository (HTML/CSS/JS).  
- Optimized image and asset pack.  
- Copy deck (final text for all sections).  
- Launch checklist + smoke test results.  
- Lightweight analytics dashboard (or event log).

---

## 15) Open Decisions (Owner Sign-Off Needed)
- Confirm **correct month** for Miracle/Butterfly visit to set Quiz 1 answer [research.md](research.md).
- Choose **third memory** topic and correct answer mapping [research.md](research.md).
- Approve **gift clue** text and exact hiding location.  
- Approve graphics/licensing approach for BTS/BT21 accents.

---

## 16) Appendix: Implementation Notes
- IntersectionObserver threshold tuning for staggered reveals; prefers 0.2–0.3 for smoothness [research.md](research.md).
- Keep animation durations 200–400ms; easing: ease-out on entrance; limit to 60fps budget.  
- Use `prefers-reduced-motion` media query to reduce motion for sensitive users.
- Consider a simple, accessible confetti canvas with CPU guardrails (e.g., particle cap).

---

**Provenance:** This brief operationalizes key directives from the uploaded research specification describing the **one-page structure**, **BTS/BT21 thematic layer**, **quiz-centered interactions**, and **finale gift clue** experience [research.md](research.md).
