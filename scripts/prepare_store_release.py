"""Prepare a public Decky release. Preparation never sends files to GitHub."""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]


def inspect_package(path, version, source=False):
    with ZipFile(path) as archive:
        names = archive.namelist()
        for name in names:
            parts = Path(name).parts
            if not parts or parts[0] != 'Orbiter' or '..' in parts:
                raise ValueError(f'Unexpected archive path: {name}')
            if any(part in {'.git', 'work', 'node_modules', '.aws', '.codex', '__pycache__'}
                   or part.startswith('.env') for part in parts):
                raise ValueError(f'Private or runtime file in archive: {name}')
        metadata = json.loads(archive.read('Orbiter/package.json'))
        plugin = json.loads(archive.read('Orbiter/plugin.json'))
        if metadata['version'] != version or plugin['name'] != 'Orbiter':
            raise ValueError('Archive version/name does not match the release')
        required = ['Orbiter/main.py', 'Orbiter/LICENSE', 'Orbiter/THIRD_PARTY_NOTICES.md', 'Orbiter/dist/index.js']
        if source:
            required += ['Orbiter/src/index.tsx', 'Orbiter/package-lock.json', 'Orbiter/scripts/package.py']
        if not all(name in names for name in required):
            raise ValueError('Archive is incomplete')


def prepare(repo, version):
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repo):
        raise ValueError('Expected an owner/repository name')
    if not re.fullmatch(r'\d+\.\d+\.\d+', version):
        raise ValueError('Expected a numeric release version')
    package = ROOT / 'outputs' / f'Orbiter-{version}-dev.zip'
    source = ROOT / 'outputs' / f'Orbiter-{version}-source.zip'
    inspect_package(package, version)
    inspect_package(source, version, source=True)
    with ZipFile(package) as installation, ZipFile(source) as sources:
        if any(installation.read(name) != sources.read(name) for name in installation.namelist()):
            raise ValueError('Installation and source archives differ')
    digest = hashlib.sha256(package.read_bytes()).hexdigest()
    target = ROOT / 'work' / 'store-release' / version
    target.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(package, target / 'orbiter.zip')
    shutil.copyfile(source, target / 'orbiter-source.zip')
    manifest = {
        'id': -1, 'name': 'Orbiter', 'author': 'Ozan Mutlu Dursun (Rageworks)',
        'description': 'ARC Raiders conditions and reminders in your Quick Access Menu.',
        'tags': ['utility', 'notifications'], 'image_url': '',
        'versions': [{'name': version, 'hash': digest,
                      'artifact': f'https://github.com/{repo}/releases/download/v{version}/orbiter.zip'}],
    }
    (target / 'orbiter.json').write_text(json.dumps(manifest, indent=2) + '\n')
    (target / 'release-notes.md').write_text(
        f'Orbiter {version} for Decky Loader.\n\n'
        'Install or update through the Orbiter custom Decky store. '
        'Existing Orbiter preferences are stored separately from the plugin.\n\n'
        'Original code: GPL-3.0-only. Matching source is attached as orbiter-source.zip. '
        'Third-party notices are included in both archives.\n\n'
        f'SHA-256 (orbiter.zip): `{digest}`\n')
    return target


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', required=True, help='Proposed PUBLIC artifact repository, owner/name')
    parser.add_argument('--version', default=json.loads((ROOT / 'package.json').read_text())['version'])
    args = parser.parse_args()
    print(prepare(args.repo, args.version))
