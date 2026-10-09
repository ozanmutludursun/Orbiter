import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

spec = importlib.util.spec_from_file_location('prepare_store_release', Path(__file__).resolve().parents[1] / 'scripts/prepare_store_release.py')
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


class StoreReleaseTests(unittest.TestCase):
    def archive(self, root, source=False, extra=None, version='0.1.13'):
        target = root / 'outputs' / f"Orbiter-0.1.13-{'source' if source else 'dev'}.zip"
        target.parent.mkdir(exist_ok=True)
        files = {
            'Orbiter/package.json': json.dumps({'version': version}),
            'Orbiter/plugin.json': json.dumps({'name': 'Orbiter'}),
            'Orbiter/main.py': 'backend', 'Orbiter/LICENSE': 'GPL',
            'Orbiter/THIRD_PARTY_NOTICES.md': 'notices', 'Orbiter/dist/index.js': 'frontend',
        }
        if source:
            files.update({'Orbiter/src/index.tsx': 'source', 'Orbiter/package-lock.json': '{}', 'Orbiter/scripts/package.py': 'build'})
        files.update(extra or {})
        with ZipFile(target, 'w') as archive:
            for name, value in files.items():
                archive.writestr(name, value)
        return target

    def test_rejects_runtime_secrets_and_path_traversal(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in ['Orbiter/work/settings.json', 'Orbiter/.env.production', '../main.py', '/Orbiter/main.py', 'Orbiter/.git/config']:
                with self.subTest(name=name):
                    package = self.archive(root, extra={name: 'private'})
                    with self.assertRaises(ValueError):
                        release.inspect_package(package, '0.1.13')

    def test_rejects_wrong_version_and_missing_source(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaises(ValueError):
                release.inspect_package(self.archive(root, version='0.1.12'), '0.1.13')
            with self.assertRaises(ValueError):
                release.inspect_package(self.archive(root), '0.1.13', source=True)

    def test_prepares_exact_decky_identity_digest_and_immutable_url(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.archive(root)
            self.archive(root, source=True)
            old_root = release.ROOT
            try:
                release.ROOT = root
                target = release.prepare('owner/orbiter-updates', '0.1.13')
                manifest = json.loads((target / 'orbiter.json').read_text())
                self.assertEqual(manifest['name'], 'Orbiter')
                self.assertEqual(manifest['versions'][0]['artifact'], 'https://github.com/owner/orbiter-updates/releases/download/v0.1.13/orbiter.zip')
                self.assertEqual(manifest['versions'][0]['hash'], release.hashlib.sha256((target / 'orbiter.zip').read_bytes()).hexdigest())
            finally:
                release.ROOT = old_root

    def test_refuses_mismatched_installation_and_source(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.archive(root)
            self.archive(root, source=True, extra={'Orbiter/main.py': 'different backend'})
            old_root = release.ROOT
            try:
                release.ROOT = root
                with self.assertRaises(ValueError):
                    release.prepare('owner/orbiter-updates', '0.1.13')
            finally:
                release.ROOT = old_root
