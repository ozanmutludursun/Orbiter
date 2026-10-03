"""Read the official SSR data. No browser, third-party feed or executed JS."""
import html
import json
import re
import time
import unicodedata
from html.parser import HTMLParser

SOURCE = 'https://arcraiders.com/map-conditions'
REGIONS = ('europe', 'north-america', 'brazil', 'east-asia', 'oceania')
MAX_BYTES = 2_000_000


def slug(name):
    text = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


def download(url):
    import urllib.request
    if not url.startswith(SOURCE) or not re.fullmatch(r'https://arcraiders.com/map-conditions(?:/[a-z0-9-]+)?', url):
        raise ValueError('Non-official source rejected')
    request = urllib.request.Request(url, headers={'User-Agent': 'Orbiter/0.1 (Decky map-condition reader)', 'Accept': 'text/html'})
    with urllib.request.urlopen(request, timeout=12) as response:
        if not response.geturl().startswith(SOURCE):
            raise ValueError('Unexpected source redirect')
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError('Source response too large')
    return data.decode('utf-8')


def safe_svg(raw):
    if len(raw) > 40_000 or '<!' in raw:
        return None
    try:
        # Decky's frozen Python may omit XML modules. An unavailable icon must
        # never prevent the schedule backend from starting.
        import xml.etree.ElementTree as ET
        root = ET.fromstring(raw)
    except ImportError:
        return None
    except ET.ParseError:
        return None
    tags = {'svg', 'g', 'path', 'circle', 'rect', 'polygon', 'polyline', 'line', 'ellipse'}
    attrs = {'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'points'}
    for node in root.iter():
        node.tag = node.tag.split('}')[-1]
        if node.tag not in tags:
            return None
        node.attrib = {k: v for k, v in node.attrib.items() if k in attrs and not re.search(r'url\s*\(|https?:|javascript:', v, re.I)}
        for key in ('fill', 'stroke'):
            if node.get(key) == 'currentColor':
                node.set(key, '#ebe4d4')
    if root.tag != 'svg':
        return None
    root.set('xmlns', 'http://www.w3.org/2000/svg')
    root.set('fill', root.get('fill', '#ebe4d4'))
    return ET.tostring(root, encoding='unicode')


class Icons(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.key = None
        self.depth = 0
        self.parts = []
        self.icons = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = dict(attrs).get('href', '')
            match = re.fullmatch(r'/map-conditions/([a-z0-9-]+)', href)
            self.key = match.group(1) if match else None
        if tag == 'svg' and self.key and not self.depth:
            self.depth = 1
            self.parts = [self.get_starttag_text()]
        elif self.depth:
            self.depth += 1
            self.parts.append(self.get_starttag_text())

    def handle_startendtag(self, tag, attrs):
        if self.depth:
            self.parts.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self.depth:
            self.parts.append('</' + tag + '>')
            self.depth -= 1
            if not self.depth:
                svg = safe_svg(''.join(self.parts))
                if svg:
                    self.icons.setdefault(self.key, svg)
        if tag == 'a':
            self.key = None


def prop(streams, name):
    needle = '"' + name + '":'
    for stream in streams:
        if needle in stream:
            return json.JSONDecoder().raw_decode(stream.split(needle, 1)[1].lstrip())[0]
    raise ValueError('Official schedule field missing: ' + name)


def parse_page(page, obtained_at=None):
    streams = [json.loads(s) for s in re.findall(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)', page)]
    raw = prop(streams, 'liveEntries')
    items = prop(streams, 'conditionItems')
    server_now = prop(streams, 'serverNow')
    if not isinstance(raw, list) or not raw or len(raw) > 5000 or not isinstance(server_now, (float, int)):
        raise ValueError('Official schedule format changed or is empty')
    parser = Icons()
    parser.feed(page)
    catalog = {}
    for item in items:
        name = item.get('name')
        if isinstance(name, str) and 0 < len(name) < 150:
            key = slug(name)
            catalog[key] = {'id': key, 'name': name, 'kind': item.get('type', 'unknown'), 'icon': parser.icons.get(key)}
    events = []
    for row in raw:
        name, map_name = row.get('conditionName'), row.get('mapDisplayName')
        if not isinstance(name, str) or not isinstance(map_name, str):
            continue
        key = slug(name)
        catalog.setdefault(key, {'id': key, 'name': name, 'kind': 'unknown', 'icon': parser.icons.get(key)})
        times = {}
        regional = row.get('regionTimestamps') or {}
        for region in REGIONS:
            pair = regional.get(region, [row.get('startTimestamp'), row.get('endTimestamp')])
            if isinstance(pair, list) and len(pair) == 2 and all(isinstance(t, (int, float)) and not isinstance(t, bool) for t in pair) and 0 < pair[1] - pair[0] <= 86400000:
                times[region] = pair
        if times:
            events.append({'conditionId': key, 'map': map_name, 'times': times})
    if not events or not catalog:
        raise ValueError('No valid official schedule entries')
    return {'obtainedAt': obtained_at or time.time() * 1000, 'serverNow': server_now, 'events': events, 'conditions': list(catalog.values()), 'maps': sorted({e['map'] for e in events})}


def remember_condition_maps(data, previous=None):
    """Keep only observed official pairings, including prior published windows."""
    known = {}
    for snapshot in (previous or {}, data):
        for condition in snapshot.get('conditions', []):
            known.setdefault(condition['id'], set()).update(condition.get('maps', []))
        for event in snapshot.get('events', []):
            known.setdefault(event['conditionId'], set()).add(event['map'])
    for condition in data['conditions']:
        condition['maps'] = sorted(known.get(condition['id'], set()))
    return data


def fetch(previous=None):
    data = parse_page(download(SOURCE))
    old = {c['id']: c.get('icon') for c in (previous or {}).get('conditions', [])}
    missing = 0
    for condition in data['conditions']:
        if condition['icon']:
            continue
        condition['icon'] = old.get(condition['id'])
        if not condition['icon'] and missing < 4:
            missing += 1
            try:
                parser = Icons()
                parser.feed(download(SOURCE + '/' + condition['id']))
                condition['icon'] = parser.icons.get(condition['id'])
            except Exception:
                pass  # A missing illustration must not discard a valid schedule.
    return data
