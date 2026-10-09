tls-test-ca.pem is a self-signed public CA certificate generated solely for offline trust-store tests. It is never packaged as a trusted root or used by the plugin. Its private key was discarded.

official-condition-icons.json contains shape SVG samples from the official ARC Raiders map-conditions page, captured during development. Artwork belongs to Embark Studios; see THIRD_PARTY_NOTICES.md. These test-only fixtures validate icon handling without XML/HTML modules and are excluded from the Decky install ZIP.

official-schedule-2026-10-09.json contains the liveEntries, conditionItems and serverNow props captured from https://arcraiders.com/map-conditions on 2026-10-09. It preserves all 170 published records, including Redirection on Pendola Pass with React’s "$undefined" regional override marker, to reproduce the production failure offline. The fixture is test-only and excluded from the Decky install ZIP.
