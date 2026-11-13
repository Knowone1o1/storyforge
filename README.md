# StoryForge

Stories shaped by parents, played by kids. Built for the Multi-Modal AI for Education Hackathon (Beta Fund x Epic, Nov 13).

A parent enters their child's name, interests, a lesson and limits. A team of AI agents builds a live, playable story game around the child: 4 scenes, real choices with consequences, a think-back moment with a Coach, and a parent report with a before/after score.

## What is in here

| File | What it is |
| --- | --- |
| `index.html` | The whole app. One self-contained page (HTML + CSS + JavaScript). |
| `api/sample.js` | The live site's AI endpoint: receives a prompt from the page and calls Claude. The API key stays here, never in the page. |
| `api/health.js` | Tells the page it is on the live site and whether the AI key is set. |
| `package.json`, `vercel.json` | Settings the host (Vercel) needs. |
| `docs/PROMPT.md` | A ready-made prompt that explains the product to Claude, so anyone on the team can keep building. |

## Two ways the same page runs

The same `index.html` works in two places and picks the right mode by itself.

1. **Inside Claude (the "StoryForge" artifact).** Claude provides the AI, the narration voice, the microphone input and the Keenable web search. No keys. Owned by Lorenzo, so a change goes live there only when Lorenzo's Claude republishes `index.html`.
2. **As a live website (this repo on Vercel).** Anyone with the link can play, no Claude account needed. The AI goes through `api/sample.js` with our own Anthropic API key, the voice uses the browser's built-in speech (best in Chrome), and the Fact Checker web search is skipped.

### Putting the website live (one time, about 5 minutes)

1. Get an Anthropic API key at https://console.anthropic.com (Settings, API keys). Set a low monthly spend limit there.
2. Go to https://vercel.com, sign in with GitHub, choose "Add New, Project" and import this `storyforge` repo.
3. Before pressing Deploy, open "Environment Variables" and add `ANTHROPIC_API_KEY` with the key as value.
4. Press Deploy. Vercel gives a link like `storyforge-xxxx.vercel.app`. Every later `git push` updates the site by itself.

The site is public and every story costs a little API money, so remove the key (or the project) after the hackathon.

## How we work side by side

1. Before you start: get the latest version (`git pull`, or ask Claude "pull the latest StoryForge").
2. Make one small change at a time and say what you changed in the commit message.
3. Push right away (`git push`), and tell the other person. Both of us edit the same file, so short, frequent pushes avoid clashes.
4. If two changes clash, ask Claude to "merge the conflict in index.html and keep both changes".
5. The website updates by itself after each push. Lorenzo republishes the Claude artifact after pulling.

Tip: split the work by area so we rarely touch the same lines.
- Story logic and prompts: the `PROMPTS` and `STORY ENGINE` sections of `index.html`.
- Screens and looks: the `<style>` block and the `RENDER` section.

## Rules for the hackathon

- Synthetic data only: the demo children (Mia, Leo, Sam) are made up.
- Never put keys or passwords in this repo.
- Deadline 4:00 PM: exactly 3 slides in the Master Deck, with a demo video of max 2 minutes.
