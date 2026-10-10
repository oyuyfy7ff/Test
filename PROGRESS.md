# Progress

## Scope
App: Countdown to important days, with calendar, photos and reminders. Stack: Capacitor.
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

## Status
Phase: 1 (Repo + skeleton, template counter app)
Last run: none yet
Done: Phase 0 scope
Next: push skeleton, check first build is green

## Handoff
Last worked by: Claude, 2026-10-10
Changed: all skeleton files
Not tested: everything
Next: Phase 2, first APK

## Planned file tree
- capacitor.config.json
- package.json
- www/index.html, www/style.css, www/app.js
- .github/workflows/build.yml

## Known bugs
- (none)

## Versions
- Node 22, Java 21, Capacitor 8 (see Known-good versions, 2026-10-10)
