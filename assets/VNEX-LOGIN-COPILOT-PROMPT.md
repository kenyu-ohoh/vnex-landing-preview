# Copilot Codex Prompt — V-NEX Login (S00)

Paste EVERYTHING below the line into GitHub Copilot / Codex.

---

You are implementing the V-NEX login experience for this repo (`vnex-landing-preview`). Match the attached Figma/screens and the interaction demo video exactly. Do not redesign. Do not add extra marketing sections.

## Goal

Create a production-quality static login page that the existing landing can link to.

Files to add (keep the current landing stack: semantic HTML + CSS + vanilla JS, Plus Jakarta Sans, no React/Vue unless the repo already uses them):

- `login.html`
- `assets/css/login.css`
- `assets/js/login.js`

Wire the landing page `Log In` / `Employer Login` buttons to `login.html`.

Assume role background loops will live at:

- `assets/login/student-loop.mp4` (and `.webm`)
- `assets/login/staff-loop.mp4` (and `.webm`)
- `assets/login/alumni-loop.mp4` (and `.webm`)
- `assets/login/employer-loop.mp4` (and `.webm`)

If a file is missing, use a colored poster fallback so layout still works. Left media is always an infinite muted looping video, `object-fit: cover`, aligned to the **left**, height `100svh` / `100dvh`. The video column does not letterbox; crop the right edge under the glass.

## Layout (desktop 1440+)

Split screen, no page scroll on the role-select and employer sign-in states.

```
+----------------------+--------------------------------+
| LEFT MEDIA  ~48-52%  | RIGHT GLASS STAGE  ~48-52%     |
| role mp4, fit height | frosted panel + UI             |
| VTC | V-NEX lockup   |                                |
| top-left on the video|                                |
+----------------------+--------------------------------+
```

- Left: role cinematic loop + brand lockup `VTC | V-NEX · your job partner` (existing `assets/vtc-logo.svg`).
- Right: one full-height **glass sheet** that sits on top of the page gradient and slightly overlaps the video (like a notebook page covering the right half). Soft rounded sheet, not a tiny card floating in the center.
- Top-right chrome inside the glass: pill `← Back to Home` (links to `index.html#top`) and language pill `EN ▾` with ENG / 繁 / 簡. Reuse the landing i18n pattern.

Mobile / tablet ≤1080px: stack. Video becomes a 34–40vh header (`object-fit: cover`, aligned left/center). Glass sheet becomes the remaining viewport and may scroll. Role list and forms stay usable at 390px width.

## Visual system — copy these tokens exactly

### Role page gradients (right stage + bleed behind glass)

Use CSS `linear-gradient` top → bottom. These stops were sampled from the design files.

Student (default cool blue-gray page wash; left scene is navy backpack):

```css
--grad-student: linear-gradient(
  180deg,
  #8aa4c0 0%,
  #a6c2d9 52%,
  #c7d9e7 66%,
  #e4eef6 100%
);
```

Staff / Admin (mint):

```css
--grad-staff: linear-gradient(
  180deg,
  #A7CFD4 0%,
  #ACD2D7 6%,
  #B0D6DB 11%,
  #B7DDE0 19%,
  #C8EAEB 36%,
  #D2F3F5 53%,
  #D5F2F5 68%,
  #D1F0F2 78%,
  #CFEEF0 87%,
  #CDEDEF 100%
);
```

Alumni (lilac):

```css
--grad-alumni: linear-gradient(
  180deg,
  #B9A3CF 0%,
  #C4AED5 11%,
  #D2C0DF 24%,
  #DECDE8 38%,
  #EADDEF 61%,
  #EAE0F0 71%,
  #F4E8F0 73%,
  #F6EDED 77%,
  #F5EBED 85%,
  #F6EDEF 100%
);
```

Employer (peach / warm paper):

```css
--grad-employer: linear-gradient(
  180deg,
  #FCC095 0%,
  #FCC79A 8%,
  #FDCFA7 17%,
  #FCE8CC 53%,
  #FDEDD5 69%,
  #FEF0DA 78%,
  #FCF4E5 79%,
  #FCEFE2 86%,
  #F9EFE0 91%,
  #F7EBDE 100%
);
```

When the selected role changes, crossfade BOTH the left video and the page gradient in ~450–600ms. Do not hard-cut.

### Glass sheet (4-layer lighting)

The right panel is glass, not opaque white.

```css
.glass {
  background: linear-gradient(
    180deg,
    rgba(255,255,255,.34) 0%,
    rgba(255,255,255,.18) 46%,
    rgba(255,255,255,.10) 100%
  );
  backdrop-filter: blur(22px) saturate(1.15);
  -webkit-backdrop-filter: blur(22px) saturate(1.15);
  border: 1px solid rgba(255,255,255,.45);
  border-radius: 28px 0 0 28px; /* notebook edge on the left */
  /* 2 drop shadows + 2 inner shadows — Figma values */
  box-shadow:
    -3px -3px 6px rgba(233,233,233,.29),
    5px 5px 20px rgba(174,174,192,.40),
    inset -3px -3px 6px rgba(174,174,192,.25),
    inset 3px 3px 5px rgba(255,255,255,.46);
}
```

Figma glass reference (do not invent a different material): Light -45° / 80%, Refraction 100, Depth 49, Dispersion 50, Frost 20, Splay 44.

Behind the glass, keep 2–3 faint translucent “page edge” rectangles peeking from the left seam (see screens). These are decorative only.

### UI color

- Ink / titles: `#14315F` / `#1C2F57`
- Selected role bar: `#16315F` (navy)
- Unselected role bar: `#6E7580` at ~55–65% opacity, darker gray pill
- Role icon discs:
  - Student `#4C7DFF` (blue) + pause-icon style mark
  - Staff `#1FA971` (green) + list-lines mark
  - Alumni `#7B4DFF` (purple) + diamond mark
  - Employer `#F08A2A` (orange) + 2×2 grid mark
- Primary button: navy `#16315F`, fully rounded / 16px radius, white text
- Input fill: white / 82% white, 999px radius
- CAPTCHA row: same input chrome
- 2FA hint row: cream `#F8EFD8` / `#F6E7C8`, small text `#6B5A3A`
- Register link text: navy, not a button

Typography: Plus Jakarta Sans 400/500/600/700. Title “Who are you?” ~40–48px, weight 800, tight tracking. Subtitle 14–16px, `#5B6B86`.

## Information architecture / states

There are THREE right-side states. Left media always follows the current `role`.

### State A — Role select (`data-view="roles"`)

Heading:

- Title: `Who are you?`
- Subtitle: `Select a role — only that login method is shown.`

Vertical list of 4 large pills, gap ~14px, each ~64–72px tall, fully rounded.

```
[icon] Title
       meta line
                              [Login →]   ← ONLY on the selected pill
```

Copy:

| role     | title         | meta                         |
|----------|---------------|------------------------------|
| student  | Student       | Jobs · CV · Events · Alerts  |
| staff    | Staff / Admin | Manage · Insights · Approvals|
| alumni   | Alumni        | Career · Network · Jobs      |
| employer | Employer      | Post jobs · Hire talent      |

Behavior:

- Default role on first load: **Student** (matches `S00 — Login.png`). Student pill is navy and shows `Login →`.
- Clicking an unselected pill: selects it, moves `Login →` onto that pill, deselects others, crossfades left video + page gradient to that role. Do **not** open a form yet.
- Hover: slight lift. Selected pill may use a tighter inner highlight.
- Clicking `Login →` on Student / Staff / Alumni: for this preview, stay on the page and show a lightweight sign-in sheet for that role (email + password + primary “Sign in as {Role}”). Keep it visually consistent with the employer form, but simpler — no BR register. If you must stub, still build the DOM so it can be filled later.
- Clicking `Login →` on Employer, OR clicking the already-selected Employer pill again, opens State B.
- Only one login method is visible at a time.

### State B — Employer sign-in (`data-view="employer-signin"`)

This is `S00 — Login · employer.png`.

Animate from State A:

1. The 4 role pills **collapse / fold upward**.
2. A single navy **role summary bar** remains at the top of the glass content: Employer icon + “Employer” + “Post jobs · Hire talent” + pill button `↑ Back`.
3. Below that, a white/translucent form card expands downward.

Form card contents, in order:

- Title centered: `Employer sign-in`
- Email label + input, placeholder `name@company.com`
- Password label + input, masked
- CAPTCHA row: checkbox + label `CAPTCHA` inside an input-like pill (preview stub; clicking toggles checked)
- Cream note: `2FA: OTP via email or mobile after password`
- Primary CTA: `Sign in as Employer`
- Footer line: `New company? Register with BR — Admin approval required.`
  - `Register with BR` is the link that opens State C

`↑ Back` on the navy bar returns to State A with Employer still selected and the employer video/gradient still active (see demo: back does not reset to Student).

`Back to Home` always leaves the login page.

Validate on submit (preview only): email required + basic format, password required, CAPTCHA must be checked. Show inline errors. Do not call a real API; `console.log` the payload.

### State C — Employer register (`data-view="employer-register"`)

Screen name in the design system: **E00b — Employer Register**.

Same family as State B, but the **glass stage grows horizontally** to give the form more width (left video column shrinks from ~50% to ~36–40%, glass grows to ~60–64%). Form card becomes a **two-column** layout on desktop, single column on mobile. The navy summary bar CTA changes to `← Back to Login` and returns to State B, not State A.

Title: `Employer Register For VTC Career Center`

Sections and fields (required = *):

**Account Information**
- User Account Email*
- First Name*
- Last Name*

**Employer Profile**
- Company Name*
- Industry* (select)
- Region* (select)
- Company Size* (select)
- Company Description (textarea)
- Company Website

**Document Upload (BR / Equivalent Certificate)**
- BR / Equivalent Certificate No.*
- Date of BR Expiry* (date)
- BR / Equivalent Certificate* file `Browse`
  - Helper text exactly: `Please use file <5MB, with format in jpg, jpeg, png, gif, and pdf. Please do not use any special characters in file name.`

**Contact Person Details (For university's contact purpose)**
- Salutation* (select)
- Contact Name*
- Job Title*
- Contact Number*
- Contact Email* (include; implied by the contact block)

Select stubs are fine (`- Select -`). File input accept `.jpg,.jpeg,.png,.gif,.pdf`, reject >5MB and names with special characters. Primary submit: `Submit for admin approval`. Preview only; no backend.

On desktop this state MAY scroll inside the glass if the form is taller than the viewport. Left video stays pinned.

## Motion (must match the demo video)

Use CSS transitions + a small FLIP / grid-template / max-height approach. No page reload between A/B/C.

- Role select: 280ms ease for navy fill, Login chip fade/slide.
- Left video: two stacked `<video>` elements (current + next). Crossfade opacity 500ms. Next video must be `muted playsinline loop` and `.play()` on swap.
- Gradient: CSS custom property or overlay layers, 500ms.
- A → B: unselected pills animate `opacity 0` + `translateY(-12px)` + collapse height. Selected pill morphs into the top summary bar (or fade-swap if morph is fragile). Form card `opacity 0 → 1` + `translateY(16px → 0)` 420ms after the collapse starts.
- B → A: reverse. Role list expands back to 4 rows. Employer remains selected.
- B → C: glass width eases 520ms. Form content swaps with a short fade. Do not unmount the left video.
- C → B: reverse width.

Respect `prefers-reduced-motion`: instant swaps, no translate.

## Language

Port the landing `applyLanguage()` idea. Minimum strings: Back to Home, Who are you?, subtitle, 4 roles + meta, Login, Back, Employer sign-in, field labels, Sign in as Employer, register title/sections, Submit. ENG / 繁 / 簡.

Default EN. Persist selected language + selected role in `sessionStorage` so Back to Home → Log In restores them.

## Accessibility

- Role list is `role="radiogroup"`; each pill `role="radio"` with `aria-checked`.
- Keyboard: arrows move role, Enter/Space selects, Enter on Login chip advances.
- Focus rings visible on glass controls.
- Videos `aria-hidden="true"`. Poster images have empty alt.
- Form labels are real `<label>`s. Required fields `aria-required`.
- Language menu button has `aria-expanded`.

## What NOT to do

- Do not put a working search bar or job cards on this page.
- Do not implement real auth, CAPTCHA vendor, or OTP.
- Do not flatten the glass into a solid white sidebar.
- Do not stretch the video to fill the whole viewport behind everything — it is a left column, height-fit, left-aligned.
- Do not reset the employer scene when going Back from the sign-in form.
- Do not add Staff/Alumni/Student full register flows in this pass.

## Acceptance checklist

1. First paint equals `S00 — Login.png` (Student selected, backpack scene).
2. Clicking Staff / Alumni / Employer updates left loop + gradient to the matching screen (`S00 — Login · staff/alumni/employer role`).
3. Employer Login collapses the four roles into the top Employer bar and reveals `S00 — Login · employer` form.
4. Register link opens the wider E00b form; Back to Login returns to employer sign-in.
5. Glass uses the 4-layer shadow recipe.
6. Landing Log In reaches this page.
7. Lighthouse-equivalent: no layout overflow at 1440 and 390.

Implement now. After coding, list the files changed and any asset filenames you expect me to drop into `assets/login/`.
