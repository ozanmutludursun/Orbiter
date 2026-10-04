import copy
import json
import sys
import tempfile
import unittest
import importlib.util
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'defaults'))
from orbiter_core.engine import Engine, DEFAULTS, STALE_MS
from orbiter_core.source import parse_page, safe_svg, Icons, REGIONS, remember_condition_maps

NOW = 1_800_000_000_000


def snapshot(start=NOW+10_000):
    return {'obtainedAt':NOW,'serverNow':NOW,'conditions':[{'id':'new-condition','name':'New Condition','kind':'major','icon':None}],
            'maps':['New Map'], 'events':[{'conditionId':'new-condition','map':'New Map','times':{r:[start,start+3_600_000] for r in REGIONS}}]}


class EngineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.now = NOW
        self.fetch_count = 0
        def fetcher(old):
            self.fetch_count += 1
            return snapshot()
        self.engine = Engine(self.temp.name, clock=lambda:self.now, fetcher=fetcher)
        self.engine.data = snapshot()

    def tearDown(self):
        self.temp.cleanup()

    def enabled(self, **settings):
        self.engine.update_settings({'region':'europe','notifications':True,'leadMinutes':0,**settings})
        self.engine.update_session({'running':True,'known':True})

    def advance(self, ms):
        self.now += ms
        return self.engine.tick()

    def test_default_off_and_auto_stops_network(self):
        self.engine.data = None
        self.engine.update_session({'known':True,'running':False})
        self.assertEqual(self.advance(5000), [])
        self.assertEqual(self.fetch_count,0)
        self.engine.update_session({'running':True})
        self.assertEqual(self.advance(5000), [])
        self.assertEqual(self.fetch_count,1)

    def test_dynamic_content_start_and_reload_dedup(self):
        self.enabled()
        notices = self.advance(10_000)
        self.assertEqual(len(notices),1)
        self.assertIn('New Condition · New Map',notices[0]['body'])
        self.assertFalse(notices[0]['sound'])
        another = Engine(self.temp.name, clock=lambda:self.now)
        self.assertEqual(another.settings['region'],'europe')
        self.assertTrue(another.sent)
        self.assertEqual(self.advance(5000),[])

    def test_sleep_and_enable_do_not_replay(self):
        self.enabled()
        self.assertEqual(self.advance(60_000),[])
        self.engine.update_session({'running':True})
        self.assertEqual(self.advance(5000),[])
        self.engine.data = snapshot(self.now-1000)
        self.engine.update_settings({'notifications':False})
        self.engine.update_settings({'notifications':True})
        self.assertEqual(self.advance(5000),[])

    def test_stale_and_clock_jump_block_toasts(self):
        self.enabled()
        self.engine.data['serverNow'] = NOW-STALE_MS-1
        self.assertEqual(self.advance(10_000),[])
        self.assertTrue(self.engine.state()['stale'])
        self.now -= 20_000
        self.assertEqual(self.engine.tick(),[])

    def test_map_filter_and_region(self):
        self.enabled(allConditions=False,subscriptions={'new-condition':['Other Map']})
        self.assertEqual(self.advance(10_000),[])
        self.engine.data=snapshot(self.now+10_000)
        self.engine.update_settings({'subscriptions':{'new-condition':[]}})
        self.assertEqual(len(self.advance(10_000)),1)

    def test_observed_map_choices_survive_refresh_and_restart(self):
        self.engine.data = snapshot()
        changed = snapshot()
        changed['events'][0]['map'] = 'Future Map'
        changed['maps'] = ['Future Map']
        self.engine.fetcher = lambda old: copy.deepcopy(changed)
        self.engine.refresh(force=True)
        another = Engine(self.temp.name, clock=lambda:self.now)
        self.assertEqual(another.data['conditions'][0]['maps'], ['Future Map', 'New Map'])
        self.assertEqual(another.data['events'][0]['map'], 'Future Map')

    def test_old_cache_gets_condition_specific_map_choices(self):
        (Path(self.temp.name)/'cache.json').write_text(json.dumps(snapshot()))
        another = Engine(self.temp.name, clock=lambda:self.now)
        self.assertEqual(another.data['conditions'][0]['maps'], ['New Map'])

    def test_missing_icons_in_fresh_cache_trigger_only_one_early_refresh(self):
        (Path(self.temp.name)/'cache.json').write_text(json.dumps(snapshot()))
        fetcher = unittest.mock.Mock(return_value=snapshot())
        another = Engine(self.temp.name,clock=lambda:self.now,fetcher=fetcher)
        self.assertTrue(another.icon_refresh_pending)
        another.refresh()
        self.assertFalse(another.icon_refresh_pending)
        another.refresh()
        self.assertEqual(fetcher.call_count,1)

    def test_merged_and_lead(self):
        self.engine.data=snapshot(NOW+65_000)
        self.engine.data['events'].append({**self.engine.data['events'][0],'map':'Another Map'})
        self.enabled(leadMinutes=1)
        notices=self.advance(5000)
        self.assertEqual(len(notices),1)
        self.assertEqual(len(notices[0]['body'].splitlines()),2)
        self.assertIn('In 1 min',notices[0]['title'])

    def test_modes_mute_and_heartbeat(self):
        self.enabled(mode='always')
        self.engine.update_session({'running':False})
        self.assertFalse(self.engine.notify_allowed(self.now))
        self.engine.update_settings({'otherGames':True})
        self.assertTrue(self.engine.notify_allowed(self.now))
        self.engine.update_session({'muted':True})
        self.assertFalse(self.engine.notify_allowed(self.now))
        self.engine.update_session({'muted':False})
        self.engine.update_settings({'mode':'panel'})
        self.assertFalse(self.engine.active(self.now))
        self.engine.update_session({'panel':True})
        self.assertTrue(self.engine.active(self.now))
        self.now+=35_001
        self.assertFalse(self.engine.active(self.now))

    def test_fetch_failure_preserves_cache_and_subscriptions(self):
        self.enabled(allConditions=False,subscriptions={'missing-today':['Old Map']})
        def fail(old):
            raise ValueError('Broken upstream')
        self.engine.fetcher=fail
        with self.assertLogs('orbiter', level='ERROR') as logs:
            self.engine.refresh(True)
        self.assertEqual(self.engine.data['conditions'][0]['name'],'New Condition')
        self.assertIn('ValueError: Broken upstream',self.engine.error)
        self.assertIn('Last saved schedule is shown.', self.engine.error)
        self.assertIn('Broken upstream', logs.output[0])
        self.assertIn('missing-today',self.engine.settings['subscriptions'])

    def test_fetch_failure_without_cache_exposes_cause(self):
        self.engine.data = None
        def fail(old):
            raise ModuleNotFoundError("No module named 'urllib.request'")
        self.engine.fetcher = fail
        with self.assertLogs('orbiter', level='ERROR'):
            state = self.engine.refresh(True)
        self.assertIsNone(state['data'])
        self.assertIn('No saved schedule yet.', state['error'])
        self.assertIn('urllib.request', state['error'])
        self.assertNotIn('Last saved schedule is shown.', state['error'])

    def test_clock_reevaluated_after_network_request(self):
        self.enabled()
        self.engine.data['obtainedAt']=NOW-400_000
        def delayed(old):
            self.now+=60_000
            return snapshot()
        self.engine.fetcher=delayed
        self.assertEqual(self.advance(5000),[])

    def test_corrupt_settings_recover_to_safe_defaults(self):
        (Path(self.temp.name)/'settings.json').write_text('["invalid"]')
        another=Engine(self.temp.name,clock=lambda:self.now)
        self.assertFalse(another.settings['notifications'])
        self.assertEqual(another.settings['mode'],'auto')


class SourceTests(unittest.TestCase):
    def test_source_starts_when_frozen_runtime_has_no_xml_module(self):
        import builtins
        original_import = builtins.__import__
        def limited_import(name, *args, **kwargs):
            if name.startswith(('xml', 'html')):
                raise ModuleNotFoundError("No module named '" + name + "'")
            return original_import(name, *args, **kwargs)
        spec = importlib.util.spec_from_file_location('orbiter_core.limited_source', Path(__file__).resolve().parents[1]/'defaults/orbiter_core/source.py')
        module = importlib.util.module_from_spec(spec)
        with patch('builtins.__import__', side_effect=limited_import):
            spec.loader.exec_module(module)
            self.assertIn('M0 0', module.safe_svg('<svg><path d="M0 0"/></svg>'))
            icons = json.loads((Path(__file__).parent/'fixtures/official-condition-icons.json').read_text())
            for name, svg in icons.items():
                with self.subTest(condition=name):
                    self.assertIsNotNone(module.safe_svg(svg))
            row={'conditionName':'New Condition','mapDisplayName':'New Map','startTimestamp':NOW,'endTimestamp':NOW+3600000}
            self.assertEqual(module.parse_page(self.page([row]),NOW)['maps'], ['New Map'])

    def test_map_pairings_do_not_cross_conditions_or_guess_new_maps(self):
        data = snapshot()
        data['conditions'].append({'id':'other','name':'Other','kind':'minor','icon':None})
        data['maps'].extend(['Stella Montis', 'Frozen Trail'])
        data['events'].append({**data['events'][0], 'conditionId':'other', 'map':'Stella Montis'})
        remember_condition_maps(data)
        self.assertEqual(data['conditions'][0]['maps'], ['New Map'])
        self.assertEqual(data['conditions'][1]['maps'], ['Stella Montis'])

    def page(self, rows):
        data={'liveEntries':rows,'conditionItems':[{'name':'New Condition','type':'major'}],'serverNow':NOW}
        stream='1:'+json.dumps(data)
        return '<script>self.__next_f.push([1,'+json.dumps(stream)+'])</script>'

    def test_new_map_condition_and_regional_times(self):
        row={'conditionName':'New Condition','mapDisplayName':'New Map','startTimestamp':NOW,'endTimestamp':NOW+3600000,'regionTimestamps':{'north-america':[NOW+10000,NOW+3610000]}}
        result=parse_page(self.page([row]),NOW)
        self.assertEqual(result['conditions'][0]['id'],'new-condition')
        self.assertEqual(result['events'][0]['times']['north-america'][0],NOW+10000)
        self.assertEqual(result['maps'],['New Map'])

    def test_bad_shape_and_empty_schedule_rejected(self):
        with self.assertRaises(ValueError):parse_page('<html>Changed website</html>')
        with self.assertRaises(ValueError):parse_page(self.page([]))

    def test_svg_is_sanitized_and_condition_icon_wins_over_bell(self):
        self.assertIsNone(safe_svg('<svg><script>alert(1)</script></svg>'))
        svg=safe_svg('<svg onload="bad()"><path d="M0 0" fill="currentColor"/></svg>')
        self.assertNotIn('onload',svg)
        self.assertNotIn('currentColor',svg)
        parser=Icons()
        parser.feed('<a href="/map-conditions/new-condition"><svg viewBox="0 0 24 24"><path d="M0 1"/></svg><button><svg><path d="M0 2"/></svg></button></a>')
        self.assertIn('M0 1',parser.icons['new-condition'])
        self.assertNotIn('M0 2',parser.icons['new-condition'])

    def test_svg_rejects_active_content_entities_and_malformed_trees(self):
        rejected = [
            '<svg><foreignObject/></svg>', '<svg><image href="https://example.com"/></svg>',
            '<svg><use href="#p"/></svg>', '<svg><animate/></svg>',
            '<!DOCTYPE svg><svg/>', '<svg fill="&#106;avascript:bad"/>',
            '<svg><g></svg>', '<svg/><svg/>', '<path/>', '<svg>text</svg>',
            '<svg fill="red" fill="blue"/>', '<svg xmlns:x="bad"><x:path/></svg>',
            '<svg><g/><', '<svg><path d=bad/></svg>', '<svg><g\x00/></svg>',
            '<svg>' + '<g>' * 33 + '</g>' * 33 + '</svg>',
            '<svg>' + '<path/>' * 513 + '</svg>',
        ]
        for svg in rejected:
            with self.subTest(svg=svg[:80]):
                self.assertIsNone(safe_svg(svg))

    def test_svg_rebuilds_attributes_without_injection_or_external_styles(self):
        import xml.etree.ElementTree as ET  # Test oracle; never needed in Decky.
        svg = safe_svg('''<svg xmlns="evil" onload="bad()"><path d='M0 0 " onload="bad' style="fill:red" fill="url(https://example.com)" stroke="currentColor"/></svg>''')
        root = ET.fromstring(svg)
        self.assertEqual(root.tag, '{http://www.w3.org/2000/svg}svg')
        path = list(root)[0]
        self.assertEqual(path.attrib, {'d':'M0 0 " onload="bad', 'stroke':'#ebe4d4'})


if __name__=='__main__':unittest.main()
