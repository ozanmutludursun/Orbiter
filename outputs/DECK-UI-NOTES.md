# Steam Deck device review — 0.1.4

Evidence: eight user photos, 2026-10-04. Backend starts, region onboarding and navigation work. Official schedule has not loaded.

## Changes for 0.1.5

- Settings icon appears stretched horizontally: constrain native button width, minimum, maximum and flex basis.
- Side-by-side filters and footer actions exceed panel width: allow equal-width buttons to shrink within their row.
- Native dropdown inline layout divides explanations into narrow columns: use the supported below layout and shorter descriptions.
- Toggle thumb appears narrower while focused: remove the universal box-sizing override from Steam-owned elements; keep layout styles scoped to our buttons. Device verification required.
- Tracking selection copy implies live activity: use “All conditions selected”; show schedule loading/unavailable before activity status.
- Tracking view is empty when no catalog exists: add an explicit schedule-loading action and show errors there.
- Error claims saved schedule is displayed when no cache exists: distinguish missing cache; preserve underlying exception and log the full traceback.
- Main empty state repeats Retry and Load schedule: show one loading/retry action.

## Device retest still needed

- Native toggle thumb focused and unfocused; controller and touch interactions.
- Settings icon stays square; filter/footer rows remain inside QAM width.
- Dropdown selection remains readable; B returns correctly.
- Latest Orbiter log after Load schedule or Retry, to determine why official fetching fails. Current photos do not expose the underlying exception.
- Live conditions, timers and notifications cannot be validated until fetching works.

## 0.1.6: keep choices inside the panel

Region, activity, reminder lead time and toast duration now expand inline. Steam DropdownItem previously opened a separate central menu; changing its below layout did not change that behavior in 0.1.5. Inline choices use native DialogButton and Focusable; B collapses an expanded choice before returning from Settings. Controller focus after selection needs device validation.

## Consolidated screenshot review

- Photo 1: remove the extra native Orbiter heading, shorten onboarding field copy; keep one timezone explanation.
- Photo 2: eliminate the central menu for every choice control, not only region.
- Photo 3: native settings button remains 38px square; omit schedule filters until data exists; clarify missing cache.
- Photo 4: keep one retry action in empty state; hide full schedule/mute/refresh footer until data exists; use short All/Tracked and Mute alerts labels when data arrives.
- Photo 5: compact square back control beside Settings title; remove marketing subtitle; shorten toggle hints.
- Photo 6: region options remain inline; About stays last; link buttons stay horizontal.
- Photo 7: one Conditions heading; hide selection controls until a catalog exists; provide explicit Load schedule action.
- Photo 8: native toggle keeps Steam sizing and focus styles; no universal CSS rules for its internals.

UI baseline: native typography/buttons/toggles; icon controls 38px (row stars 32px), 8px row gaps, inline vertical choices with one fixed chevron, subordinate help text, selection state distinct from fetch/activity state. The focus and toggle geometry check on the real Deck remains necessary.

## 0.1.7: bound the full schedule

Upcoming defaults to six hours, with 24-hour and full published horizon choices. Render twelve upcoming rows initially and expand twelve at a time; indicate visible/total count. Map, Tracked and time filters compose; changing them resets the visible count, polling does not. Active events are not limited by the future time window. Native map filter uses the same inline choice to avoid a wall of map buttons. Compact QAM view retains six active/three upcoming rows.

## 0.1.8: functional copy and controller review

- Apply approved short labels and remove repeated explanations/slogans. Keep Activity behavior, Track all future additions and local-time information only where useful.
- Source/credit and license remain in About; main footer contains update time only.
- Map schedule has one title; All/Tracked filters and 6h/24h/All ranges stay short.
- Refresh is square alongside horizontal Mute alerts; native surfaces, toggle internals and focus ring remain Steam-owned.
- Shared InlineChoice is used in native and browser adapters, so popup behavior is testable in the preview. B/Esc closes an expanded choice and stops propagation; Settings back also stops propagation to the route.
- Accessible choice names include the field and selected value. Native A legends remain short Choose/Close/Select. Expanded and selected states are exposed.
- Frontend and Python read package.json version; eliminate hard-coded preview/backend version strings. Version appears in About and connection errors, not normal loading.
- No changes to official data parsing or notification policy. Real Deck focus/navigation and toggle verification still required.

0.1.8 verification: 20 Python tests, 3 RPC tests, typecheck, preview/Decky builds passed. Browser preview confirmed region choices expand inside Settings, Esc collapses them without leaving Settings, Show more expands 12/22 to 22/22, and changing horizon to All resets to 12/129. Native Steam styles and gamepad focus require the real Deck; browser screenshots show the preview theme only.

## 0.1.9: About and support

About credits Ozan Mutlu Dursun (Rageworks) and explains the independent community project, lack of affiliation with Embark Studios, and official schedule/icon source. Source and Support actions are stacked with an 8px gap at the bottom of Settings. Until a real support URL is configured, Support displays an inline coming-soon message without opening a browser.

## 0.1.10: system HTTPS trust store

Device screenshot reports CERTIFICATE_VERIFY_FAILED / unable to get local issuer certificate. Explicitly load the OS CA bundle into a verified default SSLContext; Decky frozen Python's compiled paths can differ from SteamOS. Preserve hostname validation and CERT_REQUIRED. No unverified SSL fallback. Offline regression tests model an empty default trust store and ensure the host root is loaded and urllib receives the verified context.

## 0.1.11: review after successful device fetch

Evidence: four user photos of 0.1.10 on 2026-10-04. Official data loads, countdowns advance between frames, native star focus produces the expected Untrack legend, and map choices stay inside the full schedule. Icons all show the diamond fallback. Star buttons are horizontal, row gaps are generous, and full-screen filters consume excessive vertical space. No toast is visible in the evidence.

- Replace optional XML parsing with a restricted shape-only SVG reader using the already available regex module. Rebuild allowed elements/attributes, reject entities, active SVG, malformed trees and excessive size/depth. No embedded icon catalog: new artwork still comes from the official website. A fresh older cache with missing icons gets one early repair refresh, then resumes the normal cadence.
- One 38×38 geometry rule covers star, cog, refresh, map-expander and back buttons. Enforce both dimensions, minimum/maximum dimensions and padding; preserve Steam surfaces/focus/toggle internals. Reduce row padding from 12 to 8px and section/filter gaps.
- Full schedule puts Show, Map and Next in a bounded three-field toolbar. Map options scroll within 176px; narrow layouts stack the fields. Remove the QAM PanelSection wrapper from the full-screen route. Upcoming paging/filter semantics stay unchanged.
- Choice selection or B/Esc collapse restores focus to its trigger. Browser keyboard verification passes; real gamepad focus remains a device check.
- Add Test notification immediately below the Notifications toggle when enabled. Uses the real RPC → decky.emit → existing toaster listener; inherits sound/duration without changing event times, mute or dedup history.

Validation: 27 Python tests and 3 RPC tests passed; typecheck and both builds passed. Live HTTPS fetching with XML/HTML imports blocked returned 157 events, 14 conditions and 14 icons. Browser verified map filtering, bounded option scrolling, keyboard reachability, focus restoration and a backend-driven simulated toast. Screenshot artifacts show the preview theme, not Steam's native theme.

Device retest: 14 official icons, square focused/unfocused actions, four active rows/readable panel spacing, toolbar/map-list controller navigation, B collapse/back, and Settings → Notifications → Test notification (selected sound and duration). Scheduled delivery and game detection still need separate device checks.

## 0.1.12: compact native rows and notification artwork

Evidence: two user photos of 0.1.11, 2026-10-04. Official condition icons now render on Deck; user confirms the manual test toast works. Scheduled delivery is still unverified. The scrolled main list passes behind the sticky Orbiter title, and condition management uses oversized button cards.

Primary source review: [MagicPods headphone tab](https://github.com/steam3d/MagicPodsDecky/blob/master/src/tab/tabHeadphones.tsx) uses native PanelSection/PanelSectionRow/ToggleField; its [action rows](https://github.com/steam3d/MagicPodsDecky/blob/master/src/components/socialButton.tsx) use Field with native controls. Its [entry point](https://github.com/steam3d/MagicPodsDecky/blob/master/src/index.tsx) bounds content in a fixed viewport. Decky Stable v3.2.9 [PluginView](https://github.com/SteamDeckHomebrew/decky-loader/blob/v3.2.9/frontend/src/components/PluginView.tsx) supplies 16px of initial top padding; [TitleView](https://github.com/SteamDeckHomebrew/decky-loader/blob/v3.2.9/frontend/src/components/TitleView.tsx) is sticky. Adding initial padding alone would not prevent scrolling behind that title. Orbiter uses these layout patterns without copying third-party implementation.

- A plugin-owned scroll viewport starts below the Decky title, adds 8px inner spacing and reserves 56px for footer legends. Width and height derive from the host instead of a fixed 300px width. View changes reset the viewport to the top. Real Steam clipping/focus scrolling remains a device check.
- Replace large condition button cards with native PanelSectionRow/Field: official icon, condition name, small map summary, and square star/map actions. Track all uses ToggleField. B/Esc closes condition-map choices before returning to Settings and restores the map trigger's focus.
- Controller A legends use short Track/Untrack/Maps labels; full condition names remain in accessible labels. All small icon controls use 32×32px geometry; schedule-toolbar controls remain 38px horizontal buttons. Main row padding drops from 8 to 6px. No Steam toggle internals, surfaces or focus styles are overridden.
- Render official sanitized SVGs as CSS masks using currentColor, including notification icons. Artwork stays readable on native focused surfaces rather than retaining a hard-coded pale fill.
- Backend notices carry condition ID/name/map/artwork. Single-condition alerts use the official toast icon; merged different conditions render each icon beside its own name/map. Manual test previews one tracked upcoming/active event without rewriting times or notification history, falling back to the generic test only when no matching event exists.

Validation: 29 Python tests, 7 Node tests, typecheck and both builds passed. Browser verified compact rows, SVG image masks, inline map choices, Escape close/focus restoration, and a backend-driven test toast with Lush Blooms artwork and Buried City text. Preview screenshots show the browser theme only. New native layout and automatically scheduled Steam notifications require the next device check.
