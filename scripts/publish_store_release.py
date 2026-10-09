"""Publish reviewed packages to an already approved PUBLIC distribution repository."""
import argparse
import base64
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

from prepare_store_release import ROOT, prepare


def gh(*args, payload=None, check=True):
    result = subprocess.run(['gh', *args], input=payload, text=True, capture_output=True, check=False)
    if check and result.returncode:
        raise RuntimeError(result.stderr.strip() or 'GitHub operation failed')
    return result


def publish(repo, version):
    metadata = json.loads(gh('api', f'repos/{repo}').stdout)
    if metadata.get('private') or metadata.get('default_branch') != 'main':
        raise ValueError('Distribution repository must be public with an initialized main branch')
    if repo.casefold() == 'ozanmutludursun/orbiter'.casefold():
        raise ValueError('Do not publish artifacts into the private development repository')
    staged = prepare(repo, version)
    tag = f'v{version}'
    release = gh('release', 'view', tag, '--repo', repo, '--json', 'tagName', check=False)
    if release.returncode:
        # A failed network/auth lookup also stops at create, before changing the manifest.
        gh('release', 'create', tag, str(staged / 'orbiter.zip'), str(staged / 'orbiter-source.zip'),
           '--repo', repo, '--title', f'Orbiter {version}', '--notes-file', str(staged / 'release-notes.md'), '--prerelease')
    # Never replace existing version assets. Check the anonymous download before advertising it.
    with tempfile.TemporaryDirectory(prefix='orbiter-release-') as temporary:
        for name in ['orbiter.zip', 'orbiter-source.zip']:
            destination = Path(temporary) / name
            url = f'https://github.com/{repo}/releases/download/{tag}/{name}'
            subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '60',
                            '--output', str(destination), url], check=True)
            if hashlib.sha256(destination.read_bytes()).digest() != hashlib.sha256((staged / name).read_bytes()).digest():
                raise ValueError(f'Published {name} differs: use a new version, do not overwrite it')
    current = gh('api', f'repos/{repo}/contents/orbiter.json', check=False)
    content = base64.b64encode((staged / 'orbiter.json').read_bytes()).decode()
    body = {'message': f'Publish Orbiter {version} update', 'content': content, 'branch': 'main'}
    if current.returncode == 0:
        existing = json.loads(current.stdout)
        if existing.get('content') and base64.b64decode(existing['content']) == (staged / 'orbiter.json').read_bytes():
            print(f'Orbiter {version} is already published.')
            return
        old = json.loads(base64.b64decode(existing['content']))['versions'][0]['name']
        if tuple(map(int, old.split('.'))) > tuple(map(int, version.split('.'))):
            raise ValueError('Refusing to roll the update channel back to an older version')
        body['sha'] = existing['sha']
    gh('api', '--method', 'PUT', f'repos/{repo}/contents/orbiter.json', '--input', '-', payload=json.dumps(body))
    print(f'Published Orbiter {version}: https://github.com/{repo}/releases/tag/{tag}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', required=True, help='Already approved public artifact repository, owner/name')
    parser.add_argument('--version', default=json.loads((ROOT / 'package.json').read_text())['version'])
    args = parser.parse_args()
    publish(args.repo, args.version)
