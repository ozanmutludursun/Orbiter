import asyncio
import sys
from pathlib import Path
import decky

sys.path.insert(0, str(Path(__file__).parent / 'defaults'))
from orbiter_core.engine import Engine


class Plugin:
    async def _main(self):
        self.engine = Engine(decky.DECKY_PLUGIN_SETTINGS_DIR, decky.DECKY_PLUGIN_RUNTIME_DIR)
        self.task = asyncio.create_task(self._worker())

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
        return self.engine.state()

    async def save_settings(self, settings):
        return self.engine.update_settings(settings)

    async def session(self, session):
        state = self.engine.update_session(session)
        if session.get('panel') and self.engine.stale(self.engine.clock()):
            return await asyncio.to_thread(self.engine.refresh)
        return state

    async def refresh(self):
        return await asyncio.to_thread(self.engine.refresh, True)

    async def _unload(self):
        self.task.cancel()
        try:
            await self.task
        except asyncio.CancelledError:
            pass
