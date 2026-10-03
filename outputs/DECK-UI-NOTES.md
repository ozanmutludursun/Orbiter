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
