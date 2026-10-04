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
