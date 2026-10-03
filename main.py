import asyncio
import sys
from pathlib import Path
import decky

sys.path.insert(0, str(Path(__file__).parent / 'defaults'))
try:
    from orbiter_core.engine import Engine
    IMPORT_ERROR = None
except Exception as exc:
    Engine = None
    IMPORT_ERROR = f'{type(exc).__name__}: {exc}'
    decky.logger.exception('Orbiter backend import failed')


class Plugin:
    async def _main(self):
        self.engine = None
        self.task = None
        self.startup_error = IMPORT_ERROR
        try:
            if Engine is None:
                return
            self.engine = Engine(decky.DECKY_PLUGIN_SETTINGS_DIR, decky.DECKY_PLUGIN_RUNTIME_DIR)
            self.task = asyncio.create_task(self._worker())
        except Exception as exc:
            self.startup_error = f'{type(exc).__name__}: {exc}'
            decky.logger.exception('Orbiter backend startup failed')

    def _engine(self):
        if not getattr(self, 'engine', None):
            raise RuntimeError('Orbiter startup failed: ' + (getattr(self, 'startup_error', IMPORT_ERROR) or 'backend is initializing'))
        return self.engine

    async def _worker(self):
        while True:
            try:
                notifications = await asyncio.to_thread(self.engine.tick)
                for notification in notifications:
                    await decky.emit('orbiter_notification', notification)
            except Exception:
                decky.logger.exception('Orbiter worker failed')
            await asyncio.sleep(5)

    async def get_state(self):
        return self._engine().state()

    async def save_settings(self, settings):
        return self._engine().update_settings(settings)

    async def session(self, session):
        self._engine()
        state = self.engine.update_session(session)
        if session.get('panel') and self.engine.stale(self.engine.clock()):
            return await asyncio.to_thread(self.engine.refresh)
        return state

    async def refresh(self):
        return await asyncio.to_thread(self._engine().refresh, True)

    async def _unload(self):
        if not getattr(self, 'task', None):
            return
        self.task.cancel()
        try:
            await self.task
        except asyncio.CancelledError:
            pass
