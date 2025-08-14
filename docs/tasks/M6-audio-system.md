# M6 — Audio System (Due: 2025-08-14)

Owner: George  
Depends on: M3  
Status: [ ] Not started / [ ] In progress / [ ] Done

## Goals

- Background random loop of BTS tracks and finale overlay with Happy Birthday, with mobile-friendly controls.

## Checklist

- [ ] Enumerate src/audio/bts-\*.mp3 in code (static list or manifest)
- [ ] Initialize HTMLAudioElement for background (bgAudio)
- [ ] Shuffle playlist; onended -> next track; loop
- [ ] Build UI: play/pause, prev/next, volume slider (moderate default)
- [ ] User gesture requirement: start playback after tap
- [ ] Finale: play src/audio/happy-birthday.mp3; lower bgAudio volume to 0.3–0.4
- [ ] Fallback (iOS): crossfade out bg, play special, resume bg after

## Acceptance Criteria

- [ ] Continuous playback across tracks; controls responsive on mobile
- [ ] Finale audio behavior matches spec with volume adjustment

## Notes

- Licensing: keep link private; personal use only
