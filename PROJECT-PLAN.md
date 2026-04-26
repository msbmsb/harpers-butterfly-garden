# Harper’s Butterfly Garden — Project Plan and Gameplay Design

## 1. Project Vision

**Harper’s Butterfly Garden** is a personalized, tablet-first web game made for Harper, a 7-year-old who loves butterflies, flowers, and nature. The game should feel like a small magical gift made especially for her: beautiful, gentle, playful, and easy to understand.

The core experience is simple: Harper guides a butterfly through a whimsical flower garden, searching for the letters of her name hidden among the flowers. As she finds each letter in **H A R P E R**, her name gradually lights up. When she completes her name, the garden blooms in celebration.

The game should feel more like guiding a living butterfly through a secret garden than controlling a traditional arcade character. There should be no pressure, no losing, no enemies, and no harsh feedback. The emotional goal is delight, curiosity, and a sense of wonder.

---

## 2. Target Player

### Primary player

- Name: Harper
- Age: 7
- Interests: butterflies, flowers, nature, colorful magical things
- Likely device: Android tablet or Android phone, possibly laptop or desktop browser

### Design implications

The game should be:

- Touch-first
- Visually clear
- Calm and encouraging
- Playable with minimal reading
- Forgiving with large hit areas
- Rewarding through animation, sparkle, and discovery
- Personalized around Harper’s name and interests

---

## 3. Platform Strategy

### Chosen platform

**Web game first**, optimized for tablet browser play.

### Rationale

The family may not have Apple devices, so a native iOS app is not the right starting point. A web game is the most flexible first version because it can be shared through a link and played on Android tablets, Android phones, iPads, laptops, and desktop browsers.

### Recommended hosting options

- **GitHub Pages** — best simple free option tied directly to the repository
- **Netlify** — easiest drag-and-drop or Git-backed deployment
- **Vercel** — useful later if the project evolves into a React or Next.js app

### Preferred first deployment path

Start with **GitHub Pages** or **Netlify** as a static site. No backend is needed for Version 1.

---

## 4. Core Game Concept

Harper sees a beautiful storybook garden. A friendly butterfly waits in the meadow. She touches or drags on the screen to guide the butterfly. Around the garden, the letters of her name are hidden or nestled among flowers:

```text
H A R P E R
```

Each time the butterfly gets close to a letter, that letter is collected. A sparkle burst appears, a gentle chime plays, and the progress tracker lights up that letter in Harper’s name. Once all six letters are collected, the garden celebrates with blooming flowers, petals, sparkles, and a personalized message.

---

## 5. Tone and Experience Principles

### The game should feel

- Magical
- Gentle
- Personal
- Cozy
- Pretty
- Safe
- Encouraging
- Nature-inspired
- Storybook-like

### The game should avoid

- Timers
- Enemies
- Game over screens
- Failure states
- Punishing mistakes
- Stressful sound effects
- Complex instructions
- Ads
- Accounts
- Login screens
- Online social features

### Design mantra

> Harper is not trying to win against the game. She is exploring a magical garden made for her.

---

## 6. First Version Gameplay

### Objective

Collect all six letters in Harper’s name.

### Input

The game is controlled through touch.

- Tap somewhere on the meadow: the butterfly glides toward that point.
- Drag finger: the butterfly follows the finger.
- Lift finger: the butterfly slows or hovers gently.

Mouse controls should also be supported for development and desktop testing.

- Click somewhere: butterfly glides toward that point.
- Click and drag: butterfly follows the pointer.

### Movement feel

The butterfly should not snap instantly to the player’s finger. It should glide smoothly toward the target, trailing slightly behind the touch point. This makes the butterfly feel alive, graceful, and magical.

Suggested movement behavior:

- Smooth acceleration toward the target point
- Gentle easing as it approaches
- Slight bobbing motion
- Wing flapping animation
- Slight rotation in the direction of travel
- Optional sparkle trail behind the butterfly

### Letter collection

Letters are hidden or semi-hidden among flowers and garden objects. They should be smaller than the early mockup with giant letters. The goal is for Harper to feel like she is searching the garden and discovering the letters.

Letters should still be readable and fair:

- Big enough for a child to recognize
- Slightly glowing or sparkling
- Nestled among flowers, not fully obscured
- Spread around the garden
- Large invisible collection radius

Version 1 should allow the letters to be collected in any order. The progress tracker lights up the correct letter position when collected.

### Win condition

The game is complete when all letters are collected.

When complete:

- Player control pauses or softens
- Butterfly glides toward the center
- The word **HARPER** appears large and beautiful
- Flowers bloom
- Petals and sparkles animate
- Extra butterflies may appear
- A message appears:

> You did it, Harper!  
> Your name made the meadow bloom!

A large **Play Again** button lets her restart.

---

## 7. Screen Flow

Version 1 should have three main screens or states.

### 1. Welcome / Start screen

Purpose: introduce the game and make it feel personal.

Elements:

- Title: **Harper’s Butterfly Garden**
- Subtitle: **Help the butterfly collect the letters in your name!**
- Large **Start** button
- Beautiful garden splash art
- Optional decorative butterfly

### 2. Main gameplay screen

Purpose: the actual play experience.

Elements:

- Static illustrated garden background
- Transparent gameplay layer for butterfly, letters, sparkles, and effects
- Progress tracker showing **H A R P E R**
- Optional mute button
- Optional restart button
- Short instruction overlay:

> Touch the meadow to guide the butterfly.

The instruction should fade after a few seconds or after the first touch.

### 3. Celebration / win overlay

Purpose: reward completion.

Elements:

- Large **HARPER** text
- Personalized success message
- Sparkles, petals, and blooming effects
- Large **Play Again** button

Recommended implementation: show the celebration as an overlay on top of the gameplay screen so the garden remains visible behind the celebration.

---

## 8. Visual Direction

### Overall style

The visual style should be whimsical, bright, soft, and storybook-like. It should resemble a polished children’s garden game or a magical illustrated storybook.

### Preferred palette

- Sky blue
- Fresh meadow green
- Soft pinks
- Lavender and purple
- Warm yellow
- White flower accents
- Golden sparkle highlights

### Mood

- Sunny
- Gentle
- Magical
- Spring-like
- Cheerful
- Calm rather than chaotic

---

## 9. Background Art Direction

### Approach

Use a **static illustrated gameplay background** and layer the interactive game objects on top.

This is the recommended approach because it provides a polished visual feel while keeping the game code simple.

### Gameplay background art spec

The gameplay background should be a whimsical storybook garden with a large open central meadow. It should be similar in style to the splash screen artwork but less busy in the center.

The scene should include:

- Blue sky
- Soft clouds
- Warm sunlight
- Open grassy meadow
- Flower beds around the edges
- A winding stepping-stone path
- Decorative elements such as:
  - Picket fence
  - Floral arch
  - Birdhouse
  - Flowering trees
  - Hanging blossoms or wisteria
  - Distant hills
- Small decorative butterflies, but not too many near the main gameplay area
- Light magical sparkles

The scene should not include:

- Text
- UI elements
- Start button
- Giant central butterfly
- Giant letters
- Large central objects that block gameplay
- Collectible letters baked into the image

### Composition guidance

- Top edge: light sky with some foliage framing
- Upper safe zone: calm enough for UI tracker and buttons
- Center: open meadow for gameplay pieces
- Sides: flowers, fence, trees, garden details
- Bottom corners: rich flowers and foreground detail
- Pathway: decorative, preferably curving from lower right or lower center into the distance

### Detail density

- High detail around edges and corners
- Medium detail in midground
- Low detail in the central gameplay area

This gives the game a beautiful look without making the playable objects hard to see.

---

## 10. Layer Structure

The game should be structured as layered web elements.

### Recommended layer stack

```text
Layer 3: UI Overlay
Layer 2: Gameplay Canvas
Layer 1: Static Background Image
```

### Layer 1 — Static background image

Contains:

- Garden scene
- Sky
- Grass
- Flowers
- Path
- Fence
- Arch
- Birdhouse
- Non-interactive scenery

Behavior:

- Static
- Full-screen or full-container
- Scales to cover viewport

### Layer 2 — Gameplay canvas

Contains:

- Player butterfly
- Collectible letters
- Touch sparkles
- Letter collection bursts
- Petals
- Optional ambient sparkles
- Optional butterfly trail

Behavior:

- Transparent canvas over background
- Updated every animation frame
- Handles movement, collision, and effects

### Layer 3 — UI overlay

Contains:

- Name progress tracker
- Mute button
- Restart button
- Instruction overlay
- Toast messages such as “You found H!”
- Celebration overlay
- Play Again button

Behavior:

- HTML/CSS elements
- Pointer events enabled only where needed
- Easier to style and manage than drawing UI in canvas

### Example DOM structure

```html
<div id="game-shell">
  <div id="background-layer"></div>

  <canvas id="game-canvas"></canvas>

  <div id="ui-layer">
    <div id="top-bar">
      <div id="progress-tracker">H A R P E R</div>
      <button id="mute-btn">🔈</button>
      <button id="restart-btn">↻</button>
    </div>

    <div id="instruction-overlay">
      Touch the meadow to guide the butterfly.
    </div>

    <div id="win-overlay" hidden>
      <h2>HARPER</h2>
      <p>You did it, Harper! Your name made the meadow bloom!</p>
      <button id="play-again-btn">Play Again</button>
    </div>
  </div>
</div>
```

---

## 11. Interactive Art Asset Strategy

### GenAI-assisted asset creation

The interactive gameplay pieces can be created with generative image tools and used as game assets.

Good GenAI asset candidates:

- Butterfly sprite
- Butterfly animation frames
- Flower letter collectibles
- Start button
- Play Again button
- Sparkle bursts
- Petal effects
- Reward stickers
- Decorative flowers
- Small icons

### Recommended workflow

1. Generate the gameplay background as one static image.
2. Generate butterfly sprite options.
3. Generate flower-letter sprite options.
4. Clean up the sprites into transparent PNG files.
5. Use those PNG files in the game canvas or as positioned HTML elements.
6. Keep code-drawn fallback versions for prototyping.

### Best tools discussed

- ChatGPT image generation — good for concept art, backgrounds, butterflies, and early asset exploration
- Midjourney — potentially excellent for high-polish, consistent storybook art style
- Leonardo AI — strong candidate for game-asset and sprite-style outputs
- Adobe Photoshop / Adobe Express / Firefly / Photopea — useful for cleanup, background removal, cropping, resizing, and transparent PNG export

### Important asset requirements

For sprites:

- Transparent PNG preferred
- One asset per file
- Clean edges
- No background box
- Consistent lighting and style
- Clear silhouette
- Readable at game size

---

## 12. Butterfly Sprite Design

### Desired butterfly character

The butterfly should feel friendly, magical, and cute without becoming too cartoony or distracting. It should be visually readable on top of the garden background.

Preferred colors:

- Pink
- Purple
- Lavender
- Soft blue accents
- White sparkle details

### Sprite options discussed

Potential butterfly styles:

1. **Pink & Purple Dream**
   - Bright, cheerful, strongly matches the splash screen direction
   - Good primary candidate

2. **Lavender Fairy**
   - Softer, more purple, gentle fantasy feel
   - Good alternate skin

3. **Pastel Rainbow**
   - More colorful and playful
   - Could be an unlockable or future customization option

### Animation frames

Ideal simple animation set:

- Wings up
- Wings mid up
- Wings mid down
- Wings down
- Idle / hover pose

Version 1 can start with one butterfly image. Animation frames can be added later.

### Gameplay behavior

The butterfly should:

- Glide toward the touch point
- Bob gently
- Rotate slightly toward movement direction
- Leave a faint sparkle trail if possible
- Trigger sparkles when touching letters

---

## 13. Flower Letter Sprite Design

### Concept

Each collectible letter should look like a magical garden object, not a plain alphabet tile. The letters should be smaller and somewhat hidden among the flowers, creating a gentle seek-and-find experience.

### Visual style

- Floral
- Decorative
- Readable
- Colorful
- Sparkly
- Slightly raised or glowing
- Nestled into bushes, flower beds, or meadow patches

### Options discussed

1. **Blooming Garden**
   - Large glossy letters decorated with flowers and vines
   - Good for clear collectibles

2. **Petal & Vine**
   - Letters formed more directly from flowers
   - Feels more natural and hidden

3. **Magical Meadow**
   - Colorful, polished, clear, game-like
   - Strong candidate for Version 1

4. **Whimsical Pastel**
   - Softer colors, cute and gentle
   - Good if the background is already highly saturated

### Recommended letter behavior

Letters should be:

- Smaller than the initial mockup
- Semi-hidden among flowers
- Clearly readable when noticed
- Slightly glowing or bobbing
- Not too easy but not frustrating

### Letter placement ideas

- H tucked into lower-left flowers
- A near a small flower patch
- R near a central bush
- P near a rock or flower mound
- E near the path
- Second R near the right flower bed or fence

---

## 14. Gameplay Background Mockup Direction

We explored mockups where the letters were very large and obvious, then refined the idea toward smaller hidden letters.

### Desired final gameplay look

- The garden background remains beautiful and open.
- Harper’s butterfly is visible and slightly larger than the hidden letters.
- The letters are embedded in the garden, almost like magical discoveries.
- The letters are not huge objects dominating the field.
- The player should feel like she is exploring and spotting secret flower letters.

### Hidden letter principle

The letters should be discoverable, not invisible.

Good hidden-letter design:

- A letter is partially surrounded by flowers.
- It uses a color that fits the garden but still contrasts enough to see.
- It may have a subtle sparkle or glow.
- It is placed near a visually interesting landmark.

Bad hidden-letter design:

- Completely obscured
- Too tiny
- Same color as background
- Placed under busy UI
- Placed at screen edges where fingers or browser controls interfere

---

## 15. First Version Feature List

### Must-have features

- Personalized welcome screen
- Static illustrated background
- Tablet-first touch controls
- Mouse controls for testing
- One playable meadow level
- One butterfly player character
- Six collectible letters spelling **HARPER**
- Progress tracker showing Harper’s name
- Free-order letter collection
- Letter collection detection
- Collection sparkle effect
- Encouraging “You found H!” style messages
- Win condition
- Celebration overlay
- Play Again button
- Restart button
- Optional mute button

### Strongly recommended features

- Smooth glide movement
- Butterfly bobbing motion
- Simple wing animation
- Touch sparkle feedback
- Large forgiving collection radius
- Hidden-but-readable flower letters
- Top UI safe zone
- No accidental page scrolling on tablet
- Landscape-friendly layout

### Nice-to-have Version 1 polish

- Sparkle trail behind butterfly
- Petal burst when collecting letters
- Ambient twinkles
- Gentle chime sounds
- Flower wiggle or bloom when nearby
- Slight glow around hidden letters
- Better celebration animation

---

## 16. Features to Avoid in Version 1

To keep the first version focused and achievable, avoid:

- Multiple levels
- Accounts
- Saved progress
- Backend services
- App store release
- Complex inventory
- Scoring system
- Timers
- Enemies
- Wrong-letter penalties
- Quizzes
- Ads
- In-app purchases
- Network requirements

---

## 17. Future Feature Ideas

### 1. Multiple garden worlds

Possible levels:

- Sunny Meadow
- Rainbow Meadow
- Lavender Hill
- Moonlight Garden
- Butterfly Pond
- Secret Wildflower Path
- Spring Morning Garden
- Sunset Garden

Each world could have its own background and hidden letters.

### 2. More words to collect

After **HARPER**, future words could include:

- LOVE
- FLOWER
- BUTTERFLY
- NATURE
- SPRING
- GARDEN
- BLOOM

Could also include family names or personalized messages.

### 3. Butterfly customization

Harper could choose or unlock butterfly styles:

- Pink & Purple Dream
- Lavender Fairy
- Pastel Rainbow
- Golden Monarch
- Moonlight Blue
- Sparkle Wings

### 4. Nature journal

A journal could save discovered butterflies, flowers, and letters.

Possible pages:

- Butterflies I Found
- Flowers I Found
- My Garden Stickers
- My Favorite Meadow
- Today’s Nature Discovery

### 5. Build-a-butterfly mode

Harper could design her own butterfly by choosing:

- Wing color
- Wing pattern
- Sparkles
- Antennae style
- Favorite flower
- Name

### 6. Real-world nature missions

The game could give simple outdoor missions:

- Find a yellow flower
- Look for a butterfly
- Count five leaves
- Listen for a bird
- Find something heart-shaped in nature
- Draw your favorite flower

Completing missions could unlock stickers.

### 7. Gentle educational layer

The game could introduce:

- Letter recognition
- Spelling
- Flower names
- Butterfly facts
- Colors
- Seasons
- Weather

The educational layer should remain subtle and playful.

### 8. Family voice narration

A very personal future feature would be recorded voice clips from family.

Examples:

- “Great job, Harper!”
- “You found the H!”
- “Your garden is blooming!”
- “We love you, Harper!”

This would make the game feel even more special.

### 9. Sticker rewards

After each completion, Harper could earn a sticker:

- Butterfly Name Helper
- Flower Finder
- Sparkle Collector
- Garden Explorer
- Monarch Friend
- Rainbow Meadow Helper

### 10. Progressive discovery

Instead of all letters appearing immediately, the game could reveal clues:

- A flower glows when a letter is nearby.
- The butterfly sparkles more when close.
- A gentle sound gets brighter near hidden letters.
- A flower opens to reveal a letter.

---

## 18. Technical Design

### Recommended stack

- HTML
- CSS
- JavaScript
- Canvas

### Why this stack

- No build tools required
- Easy to host as static files
- Works across browsers
- Simple to understand and modify
- Good for a small personalized game

### Initial file structure

```text
harpers-butterfly-garden/
  index.html
  styles.css
  game.js
  assets/
    garden-background.png
    butterfly.png
    letter-h.png
    letter-a.png
    letter-r-1.png
    letter-p.png
    letter-e.png
    letter-r-2.png
```

### Possible later structure

```text
harpers-butterfly-garden/
  index.html
  styles.css
  game.js
  assets/
    backgrounds/
      sunny-meadow.png
      rainbow-meadow.png
    butterflies/
      pink-purple-1.png
      pink-purple-2.png
      lavender-1.png
    letters/
      blooming-garden-h.png
      blooming-garden-a.png
    effects/
      sparkle-burst.png
      petal.png
    audio/
      collect-chime.mp3
      win-sparkle.mp3
```

### Game state model

Simple states:

```text
welcome
playing
won
```

### Core entities

#### Butterfly

```js
{
  x,
  y,
  targetX,
  targetY,
  angle,
  wingFrame,
  speed
}
```

#### Letter collectible

```js
{
  char: "H",
  index: 0,
  x,
  y,
  collected: false,
  hiddenLevel,
  glowPhase
}
```

#### Particle / sparkle

```js
{
  x,
  y,
  vx,
  vy,
  life,
  color,
  size
}
```

---

## 19. Development Plan

### Phase 1 — Working prototype

Goal: prove the game loop.

Tasks:

- Create basic HTML/CSS/JS project
- Add welcome screen
- Add game screen
- Add canvas
- Add tap/click movement
- Draw placeholder butterfly
- Draw placeholder letters
- Detect collection
- Show win state

Status: initial prototype has been created as a simple working build.

### Phase 2 — Visual foundation

Goal: make it look like Harper’s world.

Tasks:

- Choose final gameplay background
- Add static background image layer
- Improve title screen styling
- Add real or improved butterfly sprite
- Add better letter visuals
- Ensure layout works on tablet screens

### Phase 3 — Gameplay polish

Goal: make the butterfly feel magical.

Tasks:

- Improve movement easing
- Add bobbing
- Add wing animation
- Add sparkle trail
- Add touch sparkle marker
- Improve letter collection radius
- Add collection burst effects
- Add “You found H!” toast messages

### Phase 4 — Hidden letter experience

Goal: make collecting letters feel like discovery.

Tasks:

- Reduce letter size
- Place letters near flower clusters
- Add subtle glow or sparkle to letters
- Avoid overly obvious giant letters
- Use safe zones for placement
- Make letters visible enough for a 7-year-old

### Phase 5 — Celebration polish

Goal: create a delightful ending.

Tasks:

- Animate petals
- Add extra butterflies
- Brighten garden overlay
- Show large HARPER text
- Add friendly success message
- Add Play Again button
- Optional win sound

### Phase 6 — Hosting

Goal: make it playable by Harper.

Tasks:

- Choose GitHub Pages or Netlify
- Deploy static site
- Test on desktop
- Test in mobile browser responsive mode
- Have family test on Android tablet or phone
- Adjust touch behavior and layout based on feedback

---

## 20. Testing Checklist

### Device/browser testing

- Desktop Chrome
- Desktop Safari or Firefox if available
- Mobile browser emulation
- Android Chrome if possible through family testing
- Tablet landscape mode
- Tablet portrait mode, if supported

### Gameplay testing

- Start button works
- Touch/click movement works
- Butterfly follows target smoothly
- Letters are collectible
- All six letters can be collected
- Progress tracker updates correctly
- The two R letters both work correctly
- Win overlay appears
- Play Again resets the game
- Restart resets the game
- Mute button does not break gameplay

### Child usability testing

Watch whether Harper can:

- Understand what to do
- Find the butterfly
- Guide it with her finger
- Notice the letters
- Understand that the name tracker is filling in
- Complete the game without frustration
- Want to play again

---

## 21. Accessibility and Usability Notes

Although this is a small personal game, it should still be comfortable to use.

Recommendations:

- Large touch targets
- High contrast between interactive pieces and background
- Avoid tiny UI buttons
- Avoid relying only on sound
- Avoid flashing effects
- Keep motion gentle
- Use simple text
- Make instructions short
- Do not require fast reaction time

---

## 22. Current Creative Direction Summary

The strongest direction is:

> A beautiful static storybook garden background with an open meadow center, overlaid with a touch-controlled butterfly, small hidden flower letters spelling HARPER, soft sparkles, and a blooming celebration.

The letters should feel like hidden magical discoveries in the garden, not giant obvious game tokens. The butterfly should feel like Harper is guiding it gently through a magical meadow.

---

## 23. Final MVP Definition

The first complete version is successful when Harper can open a web link, tap Start, guide the butterfly with her finger, discover the hidden flower letters of her name, and see the whole garden bloom when she completes **HARPER**.

That is the heart of the project.
