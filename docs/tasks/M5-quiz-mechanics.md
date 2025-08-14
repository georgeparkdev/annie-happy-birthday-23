# M5 — Quiz Mechanics (Due: 2025-08-14)

Owner: George  
Depends on: M3, M4  
Status: [ ] Not started / [ ] In progress / [ ] Done

## Goals

- Accessible multiple-choice quizzes with feedback and progression gating.

## Checklist

- [ ] Structure quiz sections with buttons (role="button") and ARIA labels
- [ ] Encode correct answers as data-correct attributes
  - [ ] Quiz1 correct = Ноябрь
  - [ ] Quiz2 correct = Узбекистан
  - [ ] Quiz3 correct = VinPearl
- [ ] On click: immediate feedback (✔/❌), allow retry
- [ ] Unlock next-section CTA upon correct answer
- [ ] Add ARIA live region for screen reader feedback

## Acceptance Criteria

- [ ] Selections validate within ~100ms
- [ ] Next CTA is disabled until correct answer chosen
