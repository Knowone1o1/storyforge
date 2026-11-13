# StoryForge progress

Last updated: Friday Nov 13, 11:47 AM. Deck locks at 4:00 PM.

## Rule until the demo: do not use up the Gemini quota

The live site runs on a free Gemini key with a small daily limit (roughly 20 requests on the better model, one story uses 15 to 18). Every story played on the live site eats into it.

- Test with the fake AI instead: `python tools/mock_server.py`, then open http://localhost:8765. It serves the same page but answers with canned stories, so it costs nothing.
- Do not play stories on https://storyforge-tawny.vercel.app until the demo. Opening the home page is fine; pressing a story or "Suggest a lesson" is what uses quota.
- Used so far today: about 9 requests (one test story, two scenes).

## Where things are

| What | Where | State |
| --- | --- | --- |
| Live website | https://storyforge-tawny.vercel.app | Online. Uses Gemini (free key, set in Vercel). |
| Claude version | "StoryForge" artifact in Lorenzo's Claude | Online. Uses Claude. Best quality, use it for the demo video. |
| Code | this repo, `main` branch | Lorenzo (`Knowone1o1`) and Angelo (`trang0360`) can both push. |

Every `git push` to `main` updates the live website by itself within about a minute. The Claude version only changes when Lorenzo republishes it.

## Done

- App: home (quick play, 3 library stories, custom story), parent setup, warm-up question, 4 scenes with 4 hidden-type choices, think-back with Coach, one rewind, roads-not-taken map, parent report.
- Fixed: first screen stayed stuck on "Building..." after scene 1 was ready (affected the Claude version too, now republished).
- Live-site mode: the same `index.html` runs outside Claude, with `/api/sample` for the AI and the browser's own speech for narration and voice input.
- AI on the live site switched from Claude to Gemini free tier, with automatic fallback from Flash to Flash-Lite when the free limit is hit.
- GitHub repo created, Angelo added with push rights.

## Tested

With the fake AI, locally (all passed, no errors):
- Quick play, a library story and the custom setup form including "Suggest a lesson".
- Trap choice, think-back, Coach reply, rewind, typing your own idea (Interpreter).
- Ending, roads-not-taken map with 3 columns, after-question, parent report.
- Phone width (375 px): nothing runs off the side of the screen.

With the real Gemini AI, on the live site:
- Two scenes of "Dino Rescue": title, warm-up question, four choices, a fitting setback after the trap, think-back moment, two pictures.
- First scene was slow (about 37 seconds, picture under a minute later). Second scene took about 5 seconds, picture about 7 more.

## Not tested yet

- Ending and parent report with the real Gemini AI.
- Voice (narrator and microphone) on the live site. Needs a person with Chrome.
- The republished Claude version: play one story there to confirm the stuck-screen fix.
- A real phone or tablet.

## To do before 4:00 PM (from the team plan)

- [ ] Team registration form (before 3:30 PM).
- [ ] Record the demo video, max 2 minutes, from the Claude version.
- [ ] Screenshots: story screen, think-back, roads-not-taken map, parent report.
- [ ] 3 slides in the Master Deck. Slide 2: video + screenshot + the live link.
- [ ] Check the video plays from the deck.

## Ideas for after the hackathon

- Tune the layout for phones and tablets (bigger tap targets, agent panel as a drawer).
- Faster first scene on the live site.
- Fact Checker web search on the live site (it only runs in the Claude version now).
- Narration in the child's home language.
