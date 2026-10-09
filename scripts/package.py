import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
version = json.loads((root/'package.json').read_text())['version']
target = root/'outputs'/('Orbiter-'+version+'-dev.zip')
files = ['main.py','plugin.json','package.json','LICENSE','THIRD_PARTY_NOTICES.md','README.md']
files += [str(p.relative_to(root)) for folder in ('dist','defaults') for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
with ZipFile(target,'w',ZIP_DEFLATED) as archive:
    for file in files:archive.write(root/file,'Orbiter/'+file)
print(target)
source_target = root/'outputs'/('Orbiter-'+version+'-source.zip')
source_files = files + ['package-lock.json','tsconfig.json','rollup.config.js','vite.config.js','index.html','outputs/ROADMAP.md','outputs/MAC-PREVIEW.md','outputs/Orbiter Preview.command']
source_files += [str(p.relative_to(root)) for folder in ('src','scripts','tests','distribution') for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
if (root/'pnpm-lock.yaml').exists():source_files.append('pnpm-lock.yaml')
with ZipFile(source_target,'w',ZIP_DEFLATED) as archive:
    for file in source_files:archive.write(root/file,'Orbiter/'+file)
print(source_target)
