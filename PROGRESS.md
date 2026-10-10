# Progress

## Scope
App: Countdown to important days, with calendar, photos, reminders and reminder sounds. Stack: Capacitor.
App id: com.g.countdown
Platforms: Android (iOS: no)
Look: follows the phone (light/dark), main color indigo.
Screens: 1 List (home), 2 Calendar (month grid), 3 Add/Edit event.
Features and "Done when":
1. Add event: type a name, pick a date, tap Save, the event shows in the list with the days left. Close and reopen the app, it is still there.
2. Delete event: tap the bin icon, the event disappears.
3. Calendar: open the Calendar screen, days with events have a dot, tap a day to see its events.
4. Photo: in Add/Edit, tap Add photo, pick one from the gallery, a thumbnail shows, and it is still there after reopening the app.
5. Reminder: set a reminder for 1 minute from now, close the app, a notification appears.
6. Sound: in Add/Edit pick a sound and tap Listen (the preview plays), save, set a reminder for 1 minute from now, close the app, the notification plays that sound.

## Status
Phase: 3 (Features)
Last run: not checked (run `gh run list --limit 1`)
Done: Phase 0, 1. Features 1-5 built (reminders waiting for user test). Feature 6 (sound) built, not built on GitHub Actions yet.
Next: push, check the run is green, user tests Done-when line 6, then line 5 again.

## Handoff
Last worked by: Claude, 2026-10-10
Changed: www/notify.js (5 sound channels snd_<name>, channelId and sound per event), www/app.js + www/index.html + www/style.css (sound picker and Listen button), tools/make_sounds.py (new, makes 5 WAV files), .github/workflows/build.yml (new step "Make reminder sound files")
Not tested: build, the picker on the phone, sound when the notification fires

## File tree (current)
- capacitor.config.json: app id and name
- package.json: Capacitor 8 and the local-notifications plugin
- www/index.html: screens and the Add/Edit sheet (with sound picker)
- www/style.css: look, light and dark
- www/app.js: list, calendar, photos, storage, sound picker
- www/notify.js: reminders, sound list, notification channels
- tools/make_sounds.py: makes www/sounds/*.wav and android/app/src/main/res/raw/*.wav (not committed, made by the build)
- android/: generated Android project (committed after the first build)
- .github/workflows/build.yml: builds the APK
- PROGRESS.md: this file

## Known bugs
- (none known)

## Versions
- Node 22, Java 21, Capacitor 8 (see Known-good versions, 2026-10-10)
