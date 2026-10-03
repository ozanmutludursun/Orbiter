import copy
import json
import logging
import re
import threading
import time
from pathlib import Path
from . import source

DEFAULTS = {'region': None, 'mode': 'auto', 'notifications': False, 'allConditions': True,
            'subscriptions': {}, 'leadMinutes': 5, 'atStart': True, 'sound': False,
            'toastSeconds': 6, 'merge': True, 'otherGames': False}
REFRESH_MS = 5 * 60_000
STALE_MS = 20 * 60_000


def read_json(path, fallback):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return copy.deepcopy(fallback)


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False))
    temp.replace(path)


def validate_settings(values):
    if not isinstance(values, dict):
        raise ValueError('Invalid settings object')
    result = copy.deepcopy(DEFAULTS)
    result.update({k: v for k, v in values.items() if k in DEFAULTS})
    if result['region'] not in (None,) + source.REGIONS or result['mode'] not in ('auto', 'always', 'panel'):
        raise ValueError('Invalid region or activity mode')
    for key in ('notifications', 'allConditions', 'atStart', 'sound', 'merge', 'otherGames'):
        if not isinstance(result[key], bool):
            raise ValueError('Invalid setting: ' + key)
    for key, lo, hi in [('leadMinutes', 0, 60), ('toastSeconds', 3, 15)]:
        if type(result[key]) is not int or not lo <= result[key] <= hi:
            raise ValueError('Invalid timing preference')
    subs = result['subscriptions']
    if not isinstance(subs, dict) or len(subs) > 200:
        raise ValueError('Invalid subscriptions')
    for key, maps in subs.items():
        if not isinstance(key, str) or len(key) > 150 or not isinstance(maps, list) or len(maps) > 100 or any(not isinstance(m, str) or len(m) > 150 for m in maps):
            raise ValueError('Invalid map preference')
    return result


class Engine:
    def __init__(self, settings_dir, runtime_dir=None, clock=None, fetcher=None):
        self.settings_dir = Path(settings_dir)
        self.runtime_dir = Path(runtime_dir or settings_dir)
        self.clock = clock or (lambda: time.time() * 1000)
        self.fetcher = fetcher or source.fetch
        self.lock = threading.RLock()
        self.fetch_lock = threading.Lock()
        try:
            self.settings = validate_settings(read_json(self.settings_dir / 'settings.json', {}))
        except ValueError:
            self.settings = copy.deepcopy(DEFAULTS)
        self.data = read_json(self.runtime_dir / 'cache.json', None)
        if not isinstance(self.data, dict) or not all(k in self.data for k in ('events', 'conditions', 'serverNow', 'obtainedAt')):
            self.data = None
        if self.data:
            source.remember_condition_maps(self.data)
        self.sent = read_json(self.runtime_dir / 'sent.json', {})
        if not isinstance(self.sent, dict):
            self.sent = {}
        self.session = {'running': False, 'known': False, 'panel': False, 'muted': False}
        self.heartbeat = 0
        self.last_attempt = 0
        self.last_tick = self.clock()
        self.error = None
        self.refreshing = False
        self.demo = False
        support = read_json(Path(__file__).resolve().parents[1] / 'config.json', {}).get('supportUrl', '')
        self.support_url = support if isinstance(support, str) and re.fullmatch(r'https://ko-fi\.com/[A-Za-z0-9_-]+', support) else None

    def active(self, now):
        healthy = 0 <= now - self.heartbeat < 35_000
        mode = self.settings['mode']
        return healthy and (mode == 'always' or (mode == 'auto' and self.session['known'] and self.session['running']) or (mode == 'panel' and self.session['panel']))

    def stale(self, now):
        return not self.data or now - min(self.data['obtainedAt'], self.data['serverNow']) > STALE_MS or self.data['serverNow'] > now + 300_000

    def notify_allowed(self, now):
        return self.active(now) and self.settings['notifications'] and self.settings['region'] and not self.session['muted'] and not self.stale(now) and (self.session['running'] or self.settings['otherGames'] or self.settings['mode'] == 'panel')

    def update_session(self, values):
        with self.lock:
            now = self.clock()
            before = self.notify_allowed(now)
            for key in self.session:
                if key in values and isinstance(values[key], bool):
                    self.session[key] = values[key]
            self.heartbeat = now
            if before != self.notify_allowed(now):
                self.last_tick = now
            return self.state()

    def update_settings(self, values):
        with self.lock:
            self.settings = validate_settings({**self.settings, **values})
            self.last_tick = self.clock()
            write_json(self.settings_dir / 'settings.json', self.settings)
            return self.state()

    def refresh(self, force=False):
        if not self.fetch_lock.acquire(blocking=False):
            return self.state()
        try:
            now = self.clock()
            with self.lock:
                if self.demo or (not force and self.data and now - self.data['obtainedAt'] < REFRESH_MS):
                    return self.state()
                # Bound retries even when several panels reopen during an outage.
                if not force and now - self.last_attempt < 60_000:
                    return self.state()
                self.last_attempt = now
                self.refreshing = True
            try:
                data = source.remember_condition_maps(self.fetcher(self.data), self.data)
                with self.lock:
                    self.data = data
                    write_json(self.runtime_dir / 'cache.json', data)
                    self.error = None
            except Exception as exc:
                logging.getLogger('orbiter').exception('Official schedule fetch failed')
                with self.lock:
                    fallback = 'Last saved schedule is shown.' if self.data else 'No saved schedule yet.'
                    self.error = f'Official schedule unavailable. {fallback} {type(exc).__name__}: {exc}'
            finally:
                with self.lock:
                    self.refreshing = False
            return self.state()
        finally:
            self.fetch_lock.release()

    def state(self):
        with self.lock:
            now = self.clock()
            return {'settings': copy.deepcopy(self.settings), 'data': copy.deepcopy(self.data), 'session': dict(self.session),
                    'now': now, 'active': self.active(now), 'stale': self.stale(now), 'error': self.error,
                    'refreshing': self.refreshing, 'demo': self.demo, 'version': '0.1.5', 'supportUrl': self.support_url}

    def tick(self):
        now = self.clock()
        if self.active(now) and not self.demo:
            self.refresh()
        with self.lock:
            now = self.clock()
            previous, self.last_tick = self.last_tick, now
            # Sleep, reload, clock jumps and disabled periods never replay old reminders.
            if not self.notify_allowed(now) or not 0 < now - previous <= 45_000:
                return []
            settings = self.settings
            region = settings['region']
            names = {c['id']: c['name'] for c in self.data['conditions']}
            due = []
            for event in self.data['events']:
                key, map_name = event['conditionId'], event['map']
                maps = settings['subscriptions'].get(key)
                if not settings['allConditions'] and (maps is None or (maps and map_name not in maps)):
                    continue
                times = event['times'].get(region)
                if not times:
                    continue
                start, end = times
                for kind, at in [('soon', start - settings['leadMinutes'] * 60_000), ('start', start)]:
                    if (kind == 'soon' and not settings['leadMinutes']) or (kind == 'start' and not settings['atStart']):
                        continue
                    identity = '|'.join(map(str, [region, key, map_name, start, kind]))
                    if previous < at <= now and end > now and identity not in self.sent:
                        self.sent[identity] = end
                        due.append({'name': names.get(key, key), 'map': map_name, 'kind': kind, 'start': start})
            self.sent = {k: v for k, v in self.sent.items() if isinstance(v, (int, float)) and v > now}
            if due:
                write_json(self.runtime_dir / 'sent.json', self.sent)
            groups = {}
            for item in due:
                group = (item['kind'], item['start']) if settings['merge'] else len(groups)
                groups.setdefault(group, []).append(item)
            result = []
            for items in groups.values():
                first = items[0]
                title = ('Starting now' if first['kind'] == 'start' else 'In %s min' % settings['leadMinutes']) + ' · ARC Raiders'
                result.append({'title': title, 'body': '\n'.join(i['name'] + ' · ' + i['map'] for i in items), 'sound': settings['sound'], 'seconds': settings['toastSeconds']})
            return result
