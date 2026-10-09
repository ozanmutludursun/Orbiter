"""Regressions for the official site's optional fields and streamed SSR data."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'defaults'))
from orbiter_core.engine import Engine
from orbiter_core.source import parse_page, REGIONS

FIXTURE = Path(__file__).parent / 'fixtures/official-schedule-2026-10-09.json'
NOW = 1_800_000_000_000
ROW = {'conditionName':'Future Condition', 'mapDisplayName':'Future Map',
       'startTimestamp':NOW, 'endTimestamp':NOW+3_600_000}


def page(data, cuts=()):
    stream = '6:' + json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    points = [0] + sorted(cuts) + [len(stream)]
    return ''.join('<script>self.__next_f.push( [ 1, ' + json.dumps(stream[a:b]) + ' ] )</script>'
                   for a, b in zip(points, points[1:]))


def payload(rows):
    return {'liveEntries':rows, 'conditionItems':[], 'serverNow':NOW}


class OfficialScheduleTests(unittest.TestCase):
    def test_october_update_reads_every_entry_and_new_condition_map_pairing(self):
        raw = json.loads(FIXTURE.read_text())
        result = parse_page(page(raw), raw['serverNow'])
        self.assertEqual(len(result['events']), len(raw['liveEntries']))
        self.assertEqual(len(result['events']), 170)
        self.assertIn('Pendola Pass', result['maps'])
        names = {c['id'] for c in result['conditions']}
        self.assertTrue({'arc-frigate','redirection','uncovered-caches'} <= names)
        redirection = [e for e in result['events'] if e['conditionId']=='redirection']
        self.assertEqual(len(redirection), 6)
        originals = [r for r in raw['liveEntries'] if r['conditionName']=='Redirection']
        for event, original in zip(redirection, originals):
            self.assertEqual(event['map'], 'Pendola Pass')
            self.assertEqual(event['times'], {r:[original['startTimestamp'], original['endTimestamp']] for r in REGIONS})

    def test_stream_chunks_can_split_keys_and_values(self):
        raw = json.loads(FIXTURE.read_text())
        length = len('6:' + json.dumps(raw, ensure_ascii=False, indent=2) + '\n')
        whole = parse_page(page(raw), NOW)
        fragmented = parse_page(page(raw, range(17, length, 137)), NOW)
        self.assertEqual(fragmented, whole)

    def test_absent_optional_regions_use_shared_times(self):
        for value in [None, {}, '$undefined']:
            with self.subTest(value=value):
                result = parse_page(page(payload([{**ROW, 'regionTimestamps':value}])), NOW)
                self.assertEqual(result['events'][0]['times'], {r:[NOW,NOW+3_600_000] for r in REGIONS})
        result = parse_page(page(payload([ROW])), NOW)
        self.assertEqual(len(result['events'][0]['times']), len(REGIONS))

    def test_overrides_and_missing_individual_regions_remain_distinct(self):
        regional = {'north-america':[NOW+10_000,NOW+3_610_000],
                    'brazil':None, 'east-asia':'$undefined', 'oceania':[True,NOW+3_600_000]}
        result = parse_page(page(payload([{**ROW,'regionTimestamps':regional}])), NOW)
        times = result['events'][0]['times']
        self.assertEqual(times['north-america'], regional['north-america'])
        self.assertEqual(times['europe'], [NOW,NOW+3_600_000])
        self.assertEqual(times['brazil'], times['europe'])
        self.assertEqual(times['east-asia'], times['europe'])
        self.assertNotIn('oceania', times)  # Invalid explicit time is not guessed.

    def test_bad_records_do_not_discard_valid_schedule_or_invent_times(self):
        invalid = [None, [], 'unexpected', {'conditionName':12},
                   {**ROW,'regionTimestamps':'$unknown-reference'},
                   {**ROW,'regionTimestamps':['unexpected']},
                   {**ROW,'startTimestamp':float('nan')},
                   {**ROW,'endTimestamp':float('inf')},
                   {**ROW,'endTimestamp':NOW-1}]
        raw = payload(invalid+[ROW])
        raw['conditionItems'] = [None, 'unexpected', {'name':None}]
        result = parse_page(page(raw), NOW)
        self.assertEqual(len(result['events']), 1)
        self.assertEqual(result['events'][0]['conditionId'], 'future-condition')

    def test_optional_catalog_can_be_derived_from_events(self):
        for catalog in [None, '$undefined', {'changed':'shape'}]:
            raw = payload([ROW])
            raw['conditionItems'] = catalog
            with self.subTest(catalog=catalog):
                self.assertEqual(parse_page(page(raw),NOW)['conditions'][0]['name'], 'Future Condition')
        raw.pop('conditionItems')
        self.assertEqual(parse_page(page(raw),NOW)['conditions'][0]['id'], 'future-condition')

    def test_essential_schema_failure_and_invalid_server_clock_still_fail(self):
        for value in [None, True, 0, -1, float('nan'), float('inf'), '$undefined']:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'format changed'):
                parse_page(page({**payload([ROW]),'serverNow':value}), NOW)
        with self.assertRaisesRegex(ValueError, 'No valid official schedule entries'):
            parse_page(page(payload([{**ROW,'regionTimestamps':'$unknown-reference'}])), NOW)
        with self.assertRaisesRegex(ValueError, 'field missing: liveEntries'):
            parse_page(page({'serverNow':NOW}), NOW)

    def test_refresh_from_old_cache_discovers_new_content_without_resetting_preferences(self):
        raw = json.loads(FIXTURE.read_text())
        data = parse_page(page(raw), raw['serverNow'])
        with tempfile.TemporaryDirectory() as directory:
            engine = Engine(directory,clock=lambda:raw['serverNow'],fetcher=lambda old:copy.deepcopy(data))
            engine.update_settings({'region':'europe','allConditions':False,'subscriptions':{'bird-city':['Buried City']}})
            engine.data = {'obtainedAt':NOW,'serverNow':NOW,'events':[], 'maps':['Buried City'],
                           'conditions':[{'id':'bird-city','name':'Bird City','icon':None,'maps':['Buried City']}]}
            settings = copy.deepcopy(engine.settings)
            state = engine.refresh(force=True)
            self.assertIsNone(state['error'])
            self.assertEqual(state['settings'], settings)
            conditions = {c['id']:c for c in state['data']['conditions']}
            self.assertEqual(conditions['redirection']['maps'], ['Pendola Pass'])
            self.assertIn('arc-frigate', conditions)
            self.assertNotIn('redirection', state['settings']['subscriptions'])
            restored = Engine(directory,clock=lambda:raw['serverNow'])
            self.assertEqual(restored.settings, settings)
            self.assertEqual(restored.data['events'], state['data']['events'])
