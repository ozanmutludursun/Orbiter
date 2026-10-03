"""Exercise the Decky entry point, including startup failures returned over RPC."""
import builtins
import runpy
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]


class DeckyStartupTests(unittest.IsolatedAsyncioTestCase):
    async def test_failed_import_keeps_rpc_available_with_error(self):
        original_import = builtins.__import__
        def limited_import(name, *args, **kwargs):
            if name == 'orbiter_core.engine':
                raise ModuleNotFoundError("No module named 'missing_dependency'")
            return original_import(name, *args, **kwargs)
        decky = types.SimpleNamespace(logger=Mock())
        with patch.dict(sys.modules, {'decky':decky}), patch('builtins.__import__', side_effect=limited_import):
            namespace = runpy.run_path(str(ROOT/'main.py'))
        plugin = namespace['Plugin']()
        await plugin._main()
        with self.assertRaisesRegex(RuntimeError, 'missing_dependency'):
            await plugin.get_state()
        await plugin._unload()

    async def test_initial_state_is_available_without_network_or_region(self):
        with tempfile.TemporaryDirectory() as directory:
            decky = types.SimpleNamespace(logger=Mock(), DECKY_PLUGIN_SETTINGS_DIR=directory, DECKY_PLUGIN_RUNTIME_DIR=directory)
            with patch.dict(sys.modules, {'decky':decky}):
                namespace = runpy.run_path(str(ROOT/'main.py'))
            plugin = namespace['Plugin']()
            await plugin._main()
            try:
                state = await plugin.get_state()
                self.assertIsNone(state['settings']['region'])
                self.assertIsNone(state['data'])
            finally:
                await plugin._unload()
