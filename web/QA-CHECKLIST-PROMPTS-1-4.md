# Praarthana QA Checklist: Prompts 1-4

Use this file to verify the shipped changes across acquisition, activation, guided onboarding, and Learn.

Local URL:
- `http://127.0.0.1:3104`

Automated verification:
- [ ] `next typegen`
- [ ] `tsc --noEmit`
- [ ] `vitest run`
- [ ] `playwright test --reporter=line`

## Prompt 1: Acquisition

### Homepage
- [ ] Hero shows exactly one primary CTA.
- [ ] Primary CTA text is `Start free - no card needed`.
- [ ] Primary CTA links to `/register`.
- [ ] `Sign in` appears as a text link, not a button.
- [ ] `Compare plans` does not appear in the hero.
- [ ] Reassurance line appears under the CTA.
- [ ] Diaspora line appears under the CTA.
- [ ] Section order is `Hero -> Trust -> How Prarthana works -> What brings your family here today? -> Featured prayers -> Pujas -> Plans`.
- [ ] `How Prarthana works` appears and contains exactly 3 steps.
- [ ] Each `How Prarthana works` step matches `choose -> temple performs -> video delivered`.
- [ ] `Begin your first prayer - it's free` links to `/register`.
- [ ] `What brings your family here today?` appears.
- [ ] Occasion cards render and link correctly.
- [ ] Puja cards do not show booking-count social proof.
- [ ] Puja cards show a trust signal such as availability or delivery timing.
- [ ] Homepage puja prices use the same display currency as plans.

### Plans
- [ ] Monthly and annual toggle are visible.
- [ ] Annual state shows explicit yearly pricing.
- [ ] Annual state shows savings badge.
- [ ] Monthly state hides savings badge.
- [ ] `?highlight=bhakt` highlights the Bhakt card.
- [ ] `?highlight=seva` highlights the Seva card.
- [ ] No plan card is highlighted without a `highlight` query param.
- [ ] Seva preview block appears on the plans page.

### Navigation and prayers
- [ ] Logged-out users do not see `Sessions` in desktop nav.
- [ ] Logged-out users do not see `Sessions` in mobile nav.
- [ ] Logged-in users do see `Sessions`.
- [ ] Logged-out prayer cards show `Sign up to pray with family`.
- [ ] Logged-in prayer cards show `Pray with family ->`.

### Loading and responsiveness
- [ ] Loading flash does not appear during fast page transitions.
- [ ] New homepage sections are usable at `375px` width.

## Prompt 2: Activation and upgrade

### Welcome
- [ ] New registration lands on `/welcome`.
- [ ] Welcome addresses the user by first name.
- [ ] Welcome shows 3 option cards.
- [ ] Dismissing welcome starts the guided introduction handoff.
- [ ] Returning login does not show welcome again.

### Prayer paywall
- [ ] Free user opening a locked prayer sees inline paywall, not a redirect.
- [ ] Locked prayer still shows prayer title and context.
- [ ] Prayer paywall CTA points to `/plans?highlight=bhakt`.
- [ ] Bhakt user does not see the prayer paywall on the same entry.

### Waitlist limit and video gating
- [ ] Free user with one active waitlist sees limit prompt on second attempt.
- [ ] Limit prompt shows `Manage your current waitlist`.
- [ ] Limit prompt shows `Upgrade to Bhakt`.
- [ ] Join waitlist CTA is replaced when the limit prompt is shown.
- [ ] Bhakt user is not blocked by the free waitlist limit.
- [ ] Free and Bhakt users see blurred sacred-video placeholder.
- [ ] Video upgrade CTA points to `/plans?highlight=seva`.
- [ ] Seva users see the actual video experience, not the placeholder.

### Booking confirmation
- [ ] Booking confirmation page shows ceremony details card.
- [ ] Confirmation includes puja name.
- [ ] Confirmation includes family name.
- [ ] Confirmation includes wait time and video timing.
- [ ] WhatsApp share link is present.
- [ ] WhatsApp share link includes puja name in the message.
- [ ] Non-Seva users see the Seva upgrade prompt on confirmation.
- [ ] Seva users do not see the Seva prompt on confirmation.
- [ ] Confirmation email content includes puja name, family name, and expected timeline.
- [ ] Confirmation email does not include promotional upsells.

### Ambient nudges
- [ ] Prayer completion nudge appears only for free users after 7+ prayers used.
- [ ] Prayer completion nudge is dismissible.
- [ ] Dismissed prayer completion nudge stays suppressed.
- [ ] Festival bridge appears only when a festival is within 3 days.
- [ ] Festival bridge includes booking CTA to `/pujas`.

## Prompt 3: Guided flow and integration

### Guided flow
- [ ] Guided flow starts after welcome is dismissed on first login.
- [ ] Guided flow does not start before welcome is seen.
- [ ] Guided flow does not restart after completion.
- [ ] Guided flow suppresses upgrade prompts while active.
- [ ] Step 1 highlights the panchang area.
- [ ] Step 2 routes to `/prayers`.
- [ ] Step 2 updates after opening the starter prayer.
- [ ] Step 3 routes to `/pujas`.
- [ ] Step 3 updates after opening the starter puja.
- [ ] Step 4 routes to `/profile`.
- [ ] Step 4 allows family name entry inline.
- [ ] Saving family name persists and continues to Step 5.
- [ ] Skipping family name still continues to Step 5.
- [ ] Step 5 routes to `/prayers` on completion.
- [ ] Exiting the flow stores resume state.
- [ ] Resume link appears in the account menu after exit.
- [ ] Resume link is hidden after completion.

### Integration seams
- [ ] Welcome to guided-flow handoff is seamless.
- [ ] Guided flow overlay clears completely after completion.
- [ ] Family name saved in guided flow pre-fills puja booking.
- [ ] Plan highlight query params still work after guided flow and paywall navigation.

## Prompt 4: Learn

### Navigation and public routes
- [ ] `Learn` appears in primary nav between `Temple` and `Pujas`.
- [ ] `Learn` appears in mobile nav.
- [ ] `/learn` loads publicly.
- [ ] `/learn/[slug]` loads publicly for free entries.
- [ ] `/learn/category/[cat]` loads publicly.
- [ ] Learn routes are present in sitemap.
- [ ] Learn is allowed in robots rules.

### Learn index
- [ ] Learn index heading reads `Learn`.
- [ ] Featured section shows exactly 3 cards.
- [ ] All 5 category sections are present.
- [ ] `Good places to begin` shows 3 cards.
- [ ] Learn cards link to valid `/learn/[slug]` routes.

### Learn entry pages
- [ ] Entry title renders.
- [ ] Reading time renders.
- [ ] Breadcrumb links back to `/learn`.
- [ ] Markdown body renders for free entries.
- [ ] `Connect to practice` section renders.
- [ ] Related entries render.
- [ ] Free entries are fully readable while logged out.
- [ ] Bhakt entries show preview plus paywall for free users.
- [ ] Learn paywall CTA points to `/plans?highlight=bhakt`.
- [ ] Bhakt entries are fully readable for Bhakt users.
- [ ] Bhakt entries are fully readable for Seva users.

### Learn cross-links
- [ ] `Gayatri Mantra` prayer page links to `/learn/saraswati`.
- [ ] `Mahishasura Mardini` prayer page links to `/learn/bhadra-bhagavathi`.
- [ ] `Abhishekam` puja page links to `/learn/customs-abhishekam`.
- [ ] `Sahasranama Archana` puja page links to `/learn/customs-puja-explained`.
- [ ] `Kalasha Puja` puja page links to the configured Learn entry.

### Learn in guided flow and nudges
- [ ] Guided flow Step 1 link points to `/learn/the-panchang-explained`.
- [ ] Clicking the Step 1 Learn link exits the guided flow cleanly and opens the Learn page in the same tab.
- [ ] Festival nudge shows secondary Learn link when the mapped festival is approaching.
- [ ] Festival Learn link opens in the same tab.

## Content store integrity

- [ ] Learn content store contains 32 entries.
- [ ] All Learn slugs are unique.
- [ ] All Learn entries have title, subtitle, body, and connect-to-practice content.
- [ ] Exactly 3 Learn entries are marked featured.
- [ ] All 5 Learn categories contain entries.
- [ ] Related prayer slugs map to real prayer content.
- [ ] Related puja ids map to real puja content.
- [ ] Related Learn entry ids map to real Learn content.

## Current automated status

- [x] `next typegen`
- [x] `tsc --noEmit`
- [x] `vitest run` -> `39` files, `100` tests passed
- [x] `playwright test --reporter=line` -> `7` specs passed
