# M8 — Performance, Accessibility, Polish (Due: 2025-08-14)

Owner: George  
Depends on: M3–M7  
Status: [ ] Not started / [ ] In progress / [ ] Done

## Goals

- Optimize performance, ensure accessibility, and polish visuals.

## Checklist

- [ ] Compress images; use responsive sizes; add width/height or aspect-ratio
- [ ] Lazy-load below-the-fold images
- [ ] Ensure semantic structure and landmarks
- [ ] Focus states visible; keyboard navigation works
- [ ] ARIA for interactive components; live regions for quiz feedback
- [ ] Color contrast AA; test dark backgrounds with white text
- [ ] Test on iOS Safari and Android Chrome
- [ ] Fix console errors/warnings

## Acceptance Criteria

- [ ] FCP < 2s on 4G; CLS < 0.1
- [ ] No console errors in main path
- [ ] A11y checks pass (manual + basic automated)
