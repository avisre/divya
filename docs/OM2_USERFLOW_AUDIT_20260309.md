# Om 2 Userflow Audit

## Scope
- Repository audited: current `om` folder
- Actual client stack found: Android Compose app with Node/Express backend
- Note: the repo is not currently a React Native / Expo app, so this audit is based on the code that exists today

## Automated Verification
- `:androidApp:compileDebugKotlin` passed
- `:androidApp:testDebugUnitTest` passed

### Current automated unit coverage present
- Audio playback state and lifecycle
- Audio source policy
- Audio cache checksum behavior
- Prayer catalog audit

### Present but not run in this pass
- Android instrumented UI tests:
  - `StartupBenchmarkTest`
  - `PrayerMiniPlayerUiTest`
- Web e2e:
  - `web/src/e2e/landing.spec.ts`

### Coverage gap
- There is not feature-by-feature unit coverage for every app screen or every booking/profile flow today
- The current test suite proves the app builds and that the existing unit tests pass, but it is not full end-to-end coverage of all features

## Current Features Shipped in the App
- Auth:
  - Splash
  - Login
  - Register
  - Google mobile login
  - Guest session route/backend support
- Core prayer experience:
  - Home dashboard
  - Prayer Library
  - Prayer Player
  - Now Playing / mini-player
  - Prayer completion and streak tracking
- Learning and devotional exploration:
  - Deity Detail
  - Deity Learn
  - Learning Module
  - Festival Prep
  - Calendar
- Temple and puja operations:
  - Temple screen
  - Puja Detail
  - Waitlist Join
  - My Pujas
  - Gifts
  - Sacred Video
- Account and support:
  - Profile
  - Reminder settings
  - Timezone display and picker
  - Support Contact
- Shared / advanced flows:
  - Shared Prayer Create
  - Shared Prayer Session
  - Feature Operations screen
  - Gallery screen behind flag

## Current Userflow
1. Launch app
2. Splash
3. If unauthenticated: Login or Register
4. If authenticated: Home
5. From Home, users branch to Prayer Library, Temple/Puja, Calendar/Festival, Deity flows, My Pujas, Profile, or Shared Prayer
6. Temple/Puja branch leads to Waitlist Join, then My Pujas, then Sacred Video when available
7. Profile branch leads to reminders, timezone management, and support contact

## Ideal Userflow
1. Launch app
2. Splash
3. Onboarding
4. Auth or guest entry
5. Personalized Home with recommended prayer and panchang
6. Two primary branches:
   - Daily devotion: Prayer recommendation -> Prayer Player -> completion/streak/favorite
   - Temple journey: Temple/Puja discovery -> Puja Detail -> Waitlist/Book -> My Pujas -> Video ready
7. Secondary branches:
   - Festival Prep / Calendar
   - Profile / timezone / reminders
   - Shared Prayer with family

## Userflow Picture
- FigJam diagram: https://www.figma.com/online-whiteboard/create-diagram/c5e2ed13-c28c-4e68-91eb-c5bacd21bfe5?utm_source=other&utm_content=edit_in_figjam&oai_id=&request_id=43a6545f-9419-41a1-8f82-8fce51556efa

## UI/UX Fix Verification
- Festival prep timeline:
  - Duplicate diaspora note removed from per-item loop
  - Note rendered once below the timeline
- Support contact category chips:
  - Friendly labels shown to users
  - Backend/category normalization updated for `video_help` and `general`
- Gifts:
  - Duplicate bottom CTA removed
  - In-card CTA renamed to `Start gift flow`
- Waitlist join:
  - Four date pills present
  - Horizontal scrolling retained with right-edge fade
  - Prayer intention suggestion chips and helper text added
  - Character-count warning colors added
- My Pujas empty state:
  - Bullet list removed
  - Warm empty state added with Om placeholder artwork
  - `What happens next` card preserved
- Puja Video:
  - Status pipeline added
  - Existing awaiting-upload state kept as badge/title context
- Profile timezone:
  - Auto-detect fallback added
  - `Detected from device` vs `Set by you` status added
  - Timezone picker entry added

## Important Note on the Empty-State CTA Spec
- The original request had a contradiction:
  - one part asked for a single `Browse pujas` CTA inside the empty-state card
  - another part asked for both `Browse pujas` and `Open videos` as equal-priority empty-state actions
- The implemented version follows the parity decision:
  - both CTAs stay in the hero row
  - both are outlined in the empty state
  - no duplicate CTA was added inside the empty-state card

## Bottom Line
- The requested UI fixes are present in the current build
- The current Android unit test suite passes
- The app compiles successfully
- The app currently offers the feature set listed above, but it still does not have full automated coverage for every screen-level interaction
