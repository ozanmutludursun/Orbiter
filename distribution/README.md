# Orbiter custom Decky store

The owner approved making `ozanmutludursun/Orbiter` public on 9 October 2026.
Versioned packages, corresponding GPL source and release metadata use that same
repository. The Worker is prepared but **not deployed**; a custom store endpoint
still requires hosting setup.

Decky Stable v3.2.9 supports custom stores and native update prompts. This Worker
merges the live official catalogue with one Orbiter release. It does not modify
other plugins or add an updater/service to Orbiter. Install statistics are ignored;
this store collects no usage statistics.

## One-time activation

Public distribution is approved. The tracked source/history was checked before
publication; local settings, caches, credentials and personal screenshots are
excluded. Worker deployment requires the owner's hosting account.

1. Use the public `Orbiter` repository, which includes LICENSE and
   THIRD_PARTY_NOTICES.md. Keep versioned binary and source packages together.
2. Prepare the current release:
   `python3 scripts/prepare_store_release.py --repo ozanmutludursun/Orbiter`.
   It validates archive paths, identity, version and required source files, and
   stages the ZIPs, SHA-256 manifest and release notes under `work/store-release`.
3. Publish a versioned release (starting with `v0.1.14`) with the staged `orbiter.zip` and
   `orbiter-source.zip`. Verify both assets download without authentication and
   compare the installation ZIP's SHA-256 with `orbiter.json`.
4. Commit the staged `orbiter.json` to the distribution repository's `main` branch
   **after** both assets are available. Never overwrite a version's ZIP; bump the
   plugin version for subsequent releases.
5. With the owner's Cloudflare account, deploy `worker.mjs` using
   `wrangler.toml` from this directory. Confirm `ORBITER_MANIFEST_URL` matches
   the public repository. Keep credentials out of the repository.
6. Verify the deployed URL: CORS OPTIONS accepts `X-Decky-Version`, GET returns
   the official catalogue plus exactly one Orbiter, and the Orbiter version/hash
   match the published ZIP. The URL is the deployed Worker's `/plugins` endpoint.
7. On Deck: **Decky Settings → General → Store channel → Custom**, then enter
   the deployed endpoint once. Keep Decky itself on Stable.

The existing manually installed Orbiter is matched by name and version. Decky
shows an update only when the store version is newer. Equal-version installs
will not have an update badge. Decky's own installer replaces the previous plugin;
users do not need to uninstall it. Orbiter settings/runtime directories remain
separate from its installation folder. If Steam retains a stale frontend, a
restart may still be needed.

## Subsequent releases

Bump `package.json`, validate/build the plugin, run `npm run package`, and repeat
steps 2–4 with the new version. With the public repository initialized,
`python3 scripts/publish_store_release.py --repo ozanmutludursun/Orbiter`
does those publishing steps: it creates a versioned prerelease, checks anonymous
downloads of both assets, then advances the manifest. It refuses private targets,
changed existing ZIPs and accidental version rollbacks. It uses the maintainer's
existing GitHub CLI login; no tokens are saved in the project.

Publishing the new manifest makes it available to
Decky's update check; GitHub/Worker caching can delay visibility by a few minutes.
No Worker redeploy is needed for each plugin release. On Deck, open Decky's
plugin settings and use its update action. File transfer and manual ZIP selection
are no longer needed.

Changing the store is a global Decky setting. This endpoint preserves the official
catalogue so other plugins keep their update listings. If either upstream fails,
it reports a temporary store error instead of silently hiding other plugins.
Switching the store channel back to Default restores the official store; installed
Orbiter continues running but won't receive custom-channel updates.

## Why not the official store now?

The current [plugin addition checklist](https://github.com/SteamDeckHomebrew/decky-plugin-database/blob/main/.github/PULL_REQUEST_TEMPLATE/plugin_addition.md)
requires the developer to certify that generative AI did not write a majority of
the submitted code. We cannot make that certification for this project. Official
submission also involves review and device test gates; it is not an instant
development release channel. Recheck the policy if it changes.

Protocol references: [Decky v3.2.9 store client](https://github.com/SteamDeckHomebrew/decky-loader/blob/v3.2.9/frontend/src/store.tsx),
[store settings](https://github.com/SteamDeckHomebrew/decky-loader/blob/v3.2.9/frontend/src/components/settings/pages/general/StoreSelect.tsx),
[installer](https://github.com/SteamDeckHomebrew/decky-loader/blob/v3.2.9/backend/decky_loader/browser.py).

## Local verification

`node --test tests/test_store.mjs`

The Worker supports the Decky browser's CORS preflight, forwards only the two
catalogue sorting parameters and Decky version, and accepts HTTPS artifacts with
a SHA-256 digest. It has fixed catalogue/manifest upstreams; it is not an open
proxy. It validates its upstreams and bounds request waits. Live deployment,
anonymous asset download and an actual Deck update remain activation gates.
