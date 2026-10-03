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
