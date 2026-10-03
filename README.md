# Orbiter

An unofficial, minimal ARC Raiders map-condition companion for Decky Loader.
Steam Deck / SteamOS Gaming Mode is the primary target. Version 0.1.2 is a development prototype. Initial testing on Decky Stable v3.2.9 stalled at startup; this build includes startup error reporting, connection timeouts and native Steam settings controls and awaits device retesting. Not yet submitted to the Store.

## Try on a Mac

Install Node.js 20.19+ (22.12+ or newer also works) and Python 3.9+. Then:

```sh
npm ci
npm run preview
```

Open http://127.0.0.1:8765. The preview and plugin share React components and the Python schedule/notification engine. Your real Steam processes are not inspected. The preview stores its own preferences in `work/preview-data`; it does not touch Decky settings.

Choose your server region. “ARC running” simulates game lifecycle; “Live schedule” toggles a clearly labelled demo timeline made from current official content. To see a reminder, enable notifications in settings, choose a 1-minute advance reminder, then restart demo mode: the first upcoming event begins after 65 seconds, with an advance reminder after 5 seconds. The toast is simulated. Use Tab / Shift-Tab / Enter and Escape, or mouse. Stop the server with Ctrl+C.

## Behavior

- Default mode: background tracking only while ARC Raiders (Steam App ID 1808500) is running. Opening the panel can refresh stale data even with the game closed.
- Other modes: while Decky runs, or only while the panel/schedule is open. Notifications start disabled. Sound is off by default.
- Active conditions and upcoming starts; full schedule, tracked-only and map filters. New names/artwork come from the official site. All-conditions tracking includes additions; individual selections do not.
- Per-condition map choices, lead time, start reminders, toast duration, merged simultaneous events, session mute, and a separate opt-in for alerts outside ARC Raiders.
- Five-minute schedule refresh while tracking, 20-minute stale threshold, last-good cache, 12-second HTTP timeout, bounded missing-icon requests. No per-second network requests to the provider.
- No replay of missed reminders after sleep/clock jumps/reload; persisted notification identities prevent duplicate deliveries. UI heartbeat expires after 35 seconds.

## Build and test

```sh
npm run typecheck
npm test
npm run build
npm run build:preview
npm run package
```

The package is generated under `outputs`. It uses the official Decky Rollup tooling and standard-library Python only. No root flag, native binary, added service or independent updater. Decky source review and real-device tests are still required before Store submission. The Store is the intended release/update channel, and manual ZIPs are for development.

## Source and rights

Data is read from structured SSR output in [the official page](https://arcraiders.com/map-conditions). This is not a documented public API contract. If the website changes format, Orbiter may need an update. Condition icons are sanitized inline SVGs from the official condition links. Missing icons use a neutral fallback. Schedule timing may change; the plugin cannot distinguish a raid from the lobby.

Orbiter’s original code is licensed under **GPL-3.0-only**; see LICENSE. Third-party notices and artwork ownership are separate; see THIRD_PARTY_NOTICES.md. All core features are free. An optional Ko-fi link can be configured once the maintainer provides a real profile URL; no nag screens or support notifications.

The Mac preview validates content and interaction; it cannot validate Steam controller focus, game detection or Steam toast placement. See `outputs/ROADMAP.md` for the device gates and subsequent work.

The Deck build uses @decky/ui PanelSection, DialogButton, ToggleField, DropdownItem and Focusable. Steam owns their theme and focus appearance; plugin CSS supplies content layout only. The browser preview keeps a separate visual theme while sharing behavior and data.
