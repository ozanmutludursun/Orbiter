// GPL-3.0-only. Decky uses one store, so preserve its official catalogue.
const OFFICIAL = 'https://plugins.deckbrew.xyz/plugins';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
  'Access-Control-Allow-Headers': 'X-Decky-Version',
  'Access-Control-Max-Age': '600',
};

function reply(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}

function validateOrbiter(plugin) {
  const version = plugin?.versions?.[0];
  if (plugin?.name !== 'Orbiter' || !Number.isInteger(plugin.id)
      || typeof plugin.author !== 'string' || typeof plugin.description !== 'string'
      || !Array.isArray(plugin.tags) || typeof plugin.image_url !== 'string'
      || !/^\d+\.\d+\.\d+$/.test(version?.name ?? '')
      || !/^[a-f0-9]{64}$/.test(version?.hash ?? '')
      || new URL(version.artifact).protocol !== 'https:') {
    throw new Error('Invalid Orbiter release');
  }
  return plugin;
}

export function createHandler(fetcher = fetch) {
  return async (request, env) => {
    if (request.method === 'OPTIONS') return reply(null, 204);
    const incoming = new URL(request.url);
    // Decky reports installs to the selected store. This channel collects no stats.
    if (request.method === 'POST' && /^\/(?:plugins\/)?[^/]+\/versions\/[^/]+\/increment$/.test(incoming.pathname)) {
      return reply(null, 204);
    }
    if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405);
    if (!['/', '/plugins'].includes(incoming.pathname)) return reply('Not found', 404);
    try {
      const official = new URL(OFFICIAL);
      for (const key of ['sort_by', 'sort_direction']) {
        if (incoming.searchParams.has(key)) official.searchParams.set(key, incoming.searchParams.get(key));
      }
      const headers = { Accept: 'application/json', 'User-Agent': 'Orbiter-Decky-Store' };
      const decky = request.headers.get('X-Decky-Version');
      if (decky) headers['X-Decky-Version'] = decky;
      const [catalogueResponse, orbiterResponse] = await Promise.all([
        fetcher(official.toString(), { headers, signal: AbortSignal.timeout(10000), cf: { cacheTtl: 60 } }),
        fetcher(env.ORBITER_MANIFEST_URL, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000), cf: { cacheTtl: 60 } }),
      ]);
      if (!catalogueResponse.ok || !orbiterResponse.ok) throw new Error('Store upstream unavailable');
      const [catalogue, orbiter] = await Promise.all([catalogueResponse.json(), orbiterResponse.json()]);
      if (!Array.isArray(catalogue) || !catalogue.length || catalogue.some(plugin => typeof plugin.name !== 'string' || !Array.isArray(plugin.versions))) {
        throw new Error('Invalid official catalogue');
      }
      const combined = [...catalogue.filter(plugin => plugin.name !== 'Orbiter'), validateOrbiter(orbiter)];
      if (incoming.searchParams.get('sort_by') === 'name') {
        combined.sort((a, b) => a.name.localeCompare(b.name));
        if (incoming.searchParams.get('sort_direction') === 'desc') combined.reverse();
      }
      return reply(request.method === 'HEAD' ? null : JSON.stringify(combined), 200, {
        'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60',
      });
    } catch {
      // Do not silently replace all other plugins with an Orbiter-only store.
      return reply('Update catalogue temporarily unavailable. Please retry.', 502, { 'Cache-Control': 'no-store' });
    }
  };
}

export default { fetch: createHandler() };
