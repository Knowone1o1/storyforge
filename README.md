# StoryForge

Stories shaped by parents, played by kids. Built for the Multi-Modal AI for Education Hackathon (Beta Fund x Epic, Nov 13).

A parent enters their child's name, interests, a lesson and limits. A team of AI agents builds a live, playable story game around the child: 4 scenes, real choices with consequences, a think-back moment with a Coach, and a parent report with a before/after score.

## What is in here

| File | What it is |
| --- | --- |
| `index.html` | The whole app. One self-contained page (HTML + CSS + JavaScript). |
| `docs/PROMPT.md` | A ready-made prompt that explains the product to Claude, so anyone on the team can keep building. |

## Important: where the app actually runs

The app is published as a Claude artifact called "StoryForge". It only works when opened inside Claude (claude.ai or the Claude desktop app), because it uses Claude for the AI, the narration voice, the microphone input and the Keenable web search. There are no API keys anywhere.

Opening `index.html` straight from this folder shows the screens, but the AI will not run.

This repo is the shared copy of the code. The live artifact is owned by Lorenzo, so a change only goes live when Lorenzo's Claude republishes `index.html` to that artifact.

## How we work side by side

1. Before you start: get the latest version (`git pull`, or ask Claude "pull the latest StoryForge").
2. Make one small change at a time and say what you changed in the commit message.
3. Push right away (`git push`), and tell the other person. Both of us edit the same file, so short, frequent pushes avoid clashes.
4. If two changes clash, ask Claude to "merge the conflict in index.html and keep both changes".
5. Lorenzo republishes the artifact after pulling, then we test in Claude.

Tip: split the work by area so we rarely touch the same lines.
- Story logic and prompts: the `PROMPTS` and `STORY ENGINE` sections of `index.html`.
- Screens and looks: the `<style>` block and the `RENDER` section.

## Rules for the hackathon

- Synthetic data only: the demo children (Mia, Leo, Sam) are made up.
- Never put keys or passwords in this repo.
- Deadline 4:00 PM: exactly 3 slides in the Master Deck, with a demo video of max 2 minutes.
