# StoryForge progress

Last updated: Friday Nov 13, 12:35 PM. Deck locks at 4:00 PM.

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

## Newest change: tactile kids' app (from Lorenzo's design brief)

- No website header or landing text. The app opens on the bookshelf and stays on one locked screen, like a tablet app.
- Chunky look: thick plum outlines, hard drop shadows, buttons that press down. Mint wall, wooden shelves, cream paper, Fredoka everywhere.
- Real cover art: three painted covers made with Figma's AI image generator (files in `covers/`, also embedded in `index.html` so they load inside Claude). Figma file: https://www.figma.com/design/YS8Likaej3mAqOpfeUVJv8
- Tap any word to hear it. "Read to me" reads the page and lights up each word as it goes; play and pause.
- Big page buttons in the bottom corners with page dots between them.
- Finishing a book gives a confetti burst, a star in the top-right badge and a sticker on that book's cover. Stars are remembered on the device.
- Kept from before: AI-written stories, the three choice points, the 3D pictures, think-back, the map and the parent report. It is still one HTML file, not React or Tailwind.
- Tested with the fake AI at tablet and phone size. Voice timing is not checked by ear.

## Earlier change: one designed look (UI pass)

- One stylesheet replaces the three layered ones. Two typefaces: Literata (a book face) for titles and story text, Atkinson Hyperlegible for controls.
- Reading happens in a deep-blue room with the paper book as the only bright thing. Sun yellow is used only for "go on" (Next, Start reading).
- Covers are cloth-bound classic editions, type only, in the style of the PDFs in `docs/` (steel-blue serif titles, no pictures). The first word of each chapter is set bold and blue, like those PDFs.
- Home leads with the shelf. No pills, no caps labels, no pastel cards.
- The Backstage agent log is a small pill in the top bar that opens a panel.
- Tested with the fake AI at tablet and phone width: full story, think-back, rewind, own idea, ending, report. No sideways scrolling.

## Earlier change: 3D pictures

- Each page's picture is now a small animated 3D scene (a toy-like island with characters, trees, houses and so on), drawn live in the page with Three.js. Characters wave and hop, clouds drift, the camera sways gently.
- How it works: the Illustrator agent only describes the scene as a short list (what, where, which colour). Code in `index.html` (the `3D PICTURES` section) builds it from ready-made pieces. To add a new kind of object or animal, add it to `THINGS` or the character functions there.
- The hero keeps the same look through the whole book.
- Second pass on the models: characters now have faces, hair styles, hands and shoes, and they blink, look around, wave and walk. Animals have ears, muzzles and wagging tails. Scenery has detail (house with windows and chimney smoke, castle, pond with lily pads and ripples, campfire with flickering flames). The island has grass, pebbles and flowers, a gradient sky and floating specks. Everything pops in one by one when a page opens.
- 37 object types and 12 character kinds are available to the Illustrator; the list is in `scene3dPrompt` in `index.html`.
- Layout is now done by the app, not the AI (`arrange` in `index.html`). The AI names the cast, the props the text is about (with a count, for example 8 eggs) and the scenery. The app lines the props up in the middle where they can be counted, stands the cast beside them, keeps scenery in the back, and nudges everything apart so nothing overlaps.
- If 3D is not available on a device, or the AI's description is unusable, the page falls back to the old flat drawing.
- Tested with the fake AI only. How good real scenes look depends on how well the real AI places things.

## Earlier change: it is a book now

- No warm-up. A story opens straight on its title page and reads like a book: an open two-page spread, text on the left page and the moving picture on the right, page number at the bottom, a progress bar under the book.
- The child reads a few pages, then picks what happens next. Three branch points per book. One question at the very end feeds the parent report.
- Home is a bookshelf of covers, plus "Make a book for your child".
- Narrator fix: it now falls back to the browser's own voice when Claude's voice is not available, and no longer goes silent on the website after a page turn. If it fails, the Backstage panel says why.
- ElevenLabs narrator for the website: add `ELEVENLABS_API_KEY` in Vercel (Settings, Environment Variables) and redeploy. Without the key the site uses the browser voice. The Claude version keeps Claude's voice.
- Tested with the fake AI only. Voice itself still needs a person to listen.

## Earlier change: reading mode and new look

- StoryForge is now reading software first. In a story, half the screen is big reading text and the other half is a moving picture of the scene. The child reads 3 short pages, then picks what happens next.
- The scene's result ("What happened next") is its own page. The narrator can read any page aloud ("Read it to me") and reads the four choices aloud too.
- The parent report now shows words read.
- New visual style on every screen: bright blue and white, rounded, friendly, in the spirit of Epic. Phone and tablet first. The agent panel is a "Backstage" drawer at the bottom on phones and tablets.
- Tested with the fake AI only (full story, rewind, own idea, ending, report, phone width). Not yet tried with the real AI: whether the real pictures actually move depends on the AI following the new drawing instruction.

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
