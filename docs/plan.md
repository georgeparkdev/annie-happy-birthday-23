# Implementation Plan — Interactive Birthday Microsite

Document: docs/plan.md  
Source inputs: docs/project-brief.md, docs/research.md, user clarifications (Aug 14, 2025)

## Summary

Mobile-first, single-page microsite in Russian with BTS/BT21 accents, 3 memory quizzes, and a confetti-backed, gift-reveal finale. Static HTML/CSS/JS, hosted on GitHub Pages. Background BTS tracks (from src/audio/bts-\*.mp3) play continuously and randomly; at the finale, play happy-birthday.mp3 while lowering the background track volume (overlay where supported; else crossfade fallback).

Deadline: Tomorrow (launch-ready)

Owner sign-off (2025-08-14)

- Russian UI for all visible text
- Quiz 1 correct month: November; Quiz 2: Uzbekistan; Quiz 3: VinPearl (distractors: VinZoo, VinIsland)
- Finale gift clue: «в офисе, на верхней полке книжного шкафа»
- Colors/fonts approved as proposed; Icons8 BT21 accents allowed with attribution
- Proceed with BTS background tracks for a private link; fallback to instrumental if needed
- Analytics: console logs only (no external services)
- Deployment: GitHub Pages via GitHub Actions publishing src/ to gh-pages; no custom domain

## Scope & Deliverables

- One-page experience with sections:
  1. Intro
  2. Quiz 1 — Miracle/Butterfly Garden month (correct: November)
  3. Quiz 2 — Trip country (correct: Uzbekistan)
  4. Quiz 3 — Custom memory (correct: VinPearl; distractors: VinZoo, VinIsland)
  5. Finale — heartfelt message + gift clue (location: office, on top of the bookshelf) + confetti
- Russian UI copy throughout (tone: warm, playful, BTS references)
- Vanilla stack (no backend); deploy on GitHub Pages
- Audio controller: background BTS random loop + finale overlay with happy-birthday.mp3 and volume adjustment
- Image optimization and accessibility pass
- Icons8 BT21 accents with attribution
- Analytics: console logs only (anonymous, no external services)

## Milestones, Tasks, and Acceptance Criteria

### M1 — Content & Localization (Today AM)

- Tasks
  - Lock quiz answers (Q1: November; Q2: Uzbekistan; Q3: VinPearl vs VinZoo/VinIsland)
  - Draft all Russian copy (headings, captions, quiz prompts, feedback, finale message, gift clue)
  - Create gift clue text in Russian referencing: «в офисе, на верхней полке книжного шкафа»
- Acceptance
  - Copy deck complete; spelling/grammar checked; approved
- Dependencies: none

### M2 — Design System & Assets (Today AM)

- Tasks
  - Colors: BTS Purple as primary plus these suggested secondaries:  
    • Purple: #7C3AED (primary)  
    • Pink: #F472B6  
    • Sky: #38BDF8  
    • Soft Yellow: #FDE68A  
    • Navy (text accents): #0F172A
  - Fonts (Google Fonts):  
    • Headlines: "Dancing Script" or "Great Vibes"  
    • Body: "Inter" (fallback: system-ui)
  - Asset mapping:
    • Miracle/Butterfly: src/img/butterfly-and-miracle-garden-2023/_  
    • Uzbekistan: src/img/uzbekistan/_  
    • VinPearl: src/img/vinpearl/_  
    • BT21 accents: src/img/bt21/_.png (Icons8 attribution)
- Acceptance
  - Palette tokens and font choices defined in CSS variables
  - Selected images listed and tied to sections

### M3 — Section Scaffolding (Today Midday)

- Tasks
  - Build semantic sections in index.html with IDs: intro, quiz1, quiz2, quiz3, finale
  - Apply CSS scroll-snap and smooth scrolling; base layout mobile-first
  - Insert placeholder Russian copy and images per section
- Acceptance
  - Scrolling snaps to each section cleanly; no layout shifts (CLS < 0.1)

### M4 — Reveal Animations (Today Midday)

- Tasks
  - IntersectionObserver to add .in-view classes (threshold ~0.25)
  - CSS transitions for fades/slides; include prefers-reduced-motion support
- Acceptance
  - Elements animate on entering viewport; reduced-motion path verified

### M5 — Quiz Mechanics (Today Afternoon)

- Tasks
  - Implement accessible quiz buttons with immediate feedback (✔/❌) and retry
  - Gate progression (unlock next-section affordance after correct answer)
  - Config: correct answers:  
    • Quiz1: November  
    • Quiz2: Uzbekistan  
    • Quiz3: VinPearl (distractors VinZoo, VinIsland)
- Acceptance
  - All three quizzes validate correctly within 100ms and gate advancement

### M6 — Audio System (Today Afternoon)

- Tasks
  - Detect and load all src/audio/bts-\*.mp3 files into a background playlist
  - Shuffle on start; auto-advance on ended; loop playlist
  - UI: play/pause, previous/next, and volume slider (initial volume modest)
  - Finale trigger: play happy-birthday.mp3 while lowering background volume to ~30–40%  
    • Overlay with two Audio instances where supported  
    • Fallback (iOS/limited devices): crossfade background out, play happy-birthday, then resume background
- Acceptance
  - Background tracks rotate endlessly; user-initiated playback works on mobile
  - Finale playback and volume adjustment behave as specified

### M7 — Finale & Confetti (Today Late Afternoon)

- Tasks
  - Add confetti burst on gift reveal (lightweight canvas; throttle to keep 60fps)
  - Ensure heartfelt message is visible before gift clue button appears
  - Display gift clue; ensure copy is clear in Russian
- Acceptance
  - Confetti triggers reliably; message shown before clue; completion event logged

### M8 — Performance, Accessibility, and Polish (Tonight)

- Tasks
  - Optimize images (compression, responsive sizes, aspect-ratio to avoid CLS)
  - Lazy-load below-the-fold images
  - A11y: semantic structure, alt text, focus outlines, ARIA for quiz buttons
  - Cross-device checks: iOS Safari, Android Chrome; small/large screens
- Acceptance
  - FCP < 2s on 4G test; no console errors; color contrast ≥ AA; keyboard navigation viable

### M9 — Deploy (Tomorrow Morning)

- Tasks
  - Configure GitHub Pages for root or /docs build (static hosting)
  - Final smoke test on target device; share private link
- Acceptance
  - Site live on GitHub Pages; verified end-to-end

## Detailed Task Breakdown (by Area)

- HTML/CSS Structure

  - Semantic <section> for each chapter; .chapter class for shared styles
  - CSS variables for colors/spacing; mobile-first grid/flex layout
  - Scroll snapping: scroll-snap-type: y mandatory; section snap-align: start

- Reveal & Motion

  - IntersectionObserver for .reveal elements; stagger with transition-delay
  - prefers-reduced-motion: minimize animations

- Quiz Logic

  - Data attributes for correct answers; event delegation for options
  - Visual feedback: state classes (.correct/.incorrect); ARIA live region for screen readers
  - Progression: set data-complete flag or enable next CTA only when correct

- Audio Logic

  - Enumerate audio files matching bts-\*.mp3 at init (known list in code)
  - Two HTMLAudioElement instances: bgAudio and specialAudio (finale)
  - Background randomizer: shuffle array; onended -> next track
  - Volume ramp (setInterval or WebAudio API) for smooth fades
  - Mobile policy: only start after user gesture; remember user choice

- Finale & Confetti

  - Trigger on entering finale or pressing "Reveal Gift" button
  - Simple confetti via canvas; cap particles to protect battery

- Analytics (Lightweight)

  - Inline event logging to console or minimal custom tracker (no PII)
  - Track: section views, quiz selections, completion

- Localization

  - All visible strings authored in Russian
  - Keep English comments in code; ensure UTF-8 handling

- Licensing & Attribution
  - Icons8 BT21: include a small footer note/link per their license terms
  - BTS audio: personal use risk noted; do not publish publicly beyond private URL

## Risks & Mitigations

- BTS audio licensing: limit distribution; keep link private; consider instrumental/royalty-free alternatives
- Mobile audio constraints: overlay may be blocked; fallback to crossfade
- Image payload: compress aggressively; lazy-load; pre-sized containers
- Time constraint (tomorrow): prioritize M1–M7; defer optional parallax/effects

## Acceptance Criteria (Roll-up)

- Smooth section snapping; reveal animations responsive to scroll
- Quizzes validate and gate progression correctly (answers as specified)
- Audio: background loop + finale behavior with volume adjustment
- Finale: heartfelt Russian message + clear gift clue; confetti on reveal
- Performance: FCP < 2s on 4G; CLS < 0.1; no console errors
- A11y: semantic, alt text, focus states, ARIA feedback on quiz
- Deployed on GitHub Pages, link verified on mobile

## Execution Timeline (Condensed to Tomorrow)

- Today AM: M1–M2
- Midday: M3–M4
- Afternoon: M5–M6
- Late afternoon/evening: M7–M8
- Tomorrow AM: M9 (deploy)

## Next Actions (You Can Start Now)

1. Approve color/font suggestions and Russian copy approach
2. Confirm any last-minute photo picks from each folder
3. Proceed to implement M1–M3 immediately; then iterate

— End of plan —
