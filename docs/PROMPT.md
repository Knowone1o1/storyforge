# Prompt to continue building StoryForge with Claude

How to use: copy everything below the line into a new Claude chat (Claude in a browser or the desktop app). Add your request at the bottom, e.g. "the think-back screen gets stuck, fix it" or "add multilingual narration".

I'm working on StoryForge for the Multi-Modal AI for Education Hackathon (Beta Fund x Epic, Snowflake Silicon Valley AI Hub, Nov 13). Hard deadline 4:00 PM: exactly 3 slides in the Master Deck with a demo video of max 2 minutes. My team has no software experience, so do the building yourself and explain in plain words.

The product

Nobody knows what makes a kid light up better than their parents. StoryForge turns that into a live, playable story game that teaches the lesson the parent chooses.

Parent input: the child's name (the hero), age, reading level, interests and favorite things, a subject + lesson, limits (what to avoid) and consequence strength (gentle / medium / real).

Quick play: parents who just want to press play pick only a subject and an age, and the AI picks the lesson and story. The setup form also has a "Suggest a lesson" button.

Tiers: a free Story Library (ready-made templates, still generated live) and a premium custom story built around the child.

Game loop

Warm-up question about the lesson (the "before" score).

4 scenes: scenes 1–3 each end in a decision, scene 4 is the ending.

Each decision has 4 options with a hidden type the child never sees: wise, okay, tempting_bad (MUST sound fun or easy), clearly_bad. They are shuffled. This keeps stories from being one-dimensional.

The child taps an option, says it out loud, or says their own idea (the Interpreter maps it to a type).

The next scene opens with a natural consequence of that choice. A weak choice gets a setback, never shaming, and the story always continues.

After a tempting_bad or clearly_bad choice: a think-back moment. "If you could choose again, what would you do differently?" The child answers by voice and the Coach replies warmly.

One rewind per story.

Ending: a "roads not taken" map (chosen path vs where the other options led), the same warm-up question again (the "after" score), and a parent report (before → after, wise choices, the child's best quote, a conversation starter for tonight).

Agents (each a separate AI call, shown live in a side panel)

Fact Checker: Keenable web search, for geography and science only.

Director: writes each scene as JSON, including the lesson, consequences and 4 options.

Guardian: checks every scene against the parent's limits, age and quality, and fixes it if needed.

Illustrator: draws each scene as an inline SVG, keeping the hero consistent.

Narrator: Claude text-to-speech.

Interpreter: maps the child's own words to an option or a new idea.

Coach: replies during the think-back moment.

Reflector: writes the parent report.

How it's built

One self-contained HTML page published as a Claude artifact called "StoryForge" (slug 6e68f59c-7f26-4c85-9846-6c13b578f7f5). No API keys.

It uses artifact capabilities, reached in the page with await claude.use(name):

sample: Claude for all AI calls. Director, Illustrator and Reflector use the "default" tier; Guardian, Interpreter and Coach use "quick".

tts: narration.

dictation: the child's voice input.

mcp: the "Keenable Web Search" connector, tool search_web_pages.

The page can't load remote images or fetch other websites, so pictures are SVG drawn by Claude.

Screens: home (Quick play, 3 library cards, a custom-story button) → parent setup → warm-up → story → ending (map + report).

If you have the artifact tools: read the artifact, edit it, and republish the same artifact. Don't make a new one.

Judging (1–5 each)

Judges' scores decide; the audience vote only breaks ties.

Multi-modal depth

Technical execution

Usefulness with a measurable learning outcome

Product readiness / trust

Demo clarity

Ties go to technical execution, then multi-modal depth. Only synthetic data: the demo children are made up.

My request

[write what you want here]

