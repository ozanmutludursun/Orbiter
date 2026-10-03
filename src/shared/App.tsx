import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { REGIONS, type Condition, type Controls, type Event, type Region, type Settings, type State, type Transport } from './types';
import { styles } from './styles';
import { nativeStyles } from './nativeStyles';
import { Chevron } from './Chevron';

export const formatCountdown = (ms: number) => { const n = Math.max(0, Math.ceil(ms / 1000)); return n >= 3600 ? `${Math.floor(n/3600)}h ${Math.floor(n%3600/60)}m` : `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; };
const time = (ms: number) => new Date(ms).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const connectionError = (error: unknown) => error instanceof Error ? error.message : typeof error==='string' ? error : 'Orbiter backend is unavailable.';
const isTracked = (s: Settings, e: Event) => s.allConditions || (e.conditionId in s.subscriptions && (!s.subscriptions[e.conditionId].length || s.subscriptions[e.conditionId].includes(e.map)));
export function ConditionIcon({condition}: {condition?: Condition}) {return condition?.icon ? <img className="orb-condition-icon" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(condition.icon)}`} alt=""/> : <span className="orb-fallback">◇</span>;}

export function OrbiterApp({transport, controls, initialView = 'panel', layout, openSchedule}: {transport: Transport; controls: Controls; initialView?: 'panel'|'schedule'; layout?: 'panel'|'schedule'; openSchedule?(): void}) {
  const [state, setState] = useState<State>();
  const [selectedView, setView] = useState<'panel'|'settings'|'schedule'|'tracking'>(initialView);
  const baseView = layout ?? initialView;
  const view = layout && (selectedView==='panel' || selectedView==='schedule') ? layout : selectedView;
  const [trackedOnly, setTrackedOnly] = useState(false);
  const [map, setMap] = useState('All maps');
  const [expanded, setExpanded] = useState<string>();
  const [regionExpanded, setRegionExpanded] = useState(false);
  const viewAnchor = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    for(let el=viewAnchor.current?.parentElement;el;el=el.parentElement){
      if(['auto','scroll'].includes(getComputedStyle(el).overflowY)){el.scrollTop=0;break;}
    }
  },[view]);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const anchor = useRef({server: Date.now(), local: performance.now()});
  const alive = useRef(true);
  const current = useRef<State | undefined>(undefined);
  const pendingSaves = useRef(0);
  const revision = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  const apply = (s: State) => {if (alive.current) {current.current=s;setState(s); anchor.current = {server:s.now, local:performance.now()};setNow(s.now);setError(undefined);}};
  useEffect(() => {
    alive.current = true;
    const read = (request: () => Promise<State>) => {
      const startedAt = revision.current;
      return Promise.resolve().then(request).then(s => {if(startedAt===revision.current && !pendingSaves.current)apply(s);});
    };
    let polling = false;
    const update = () => {
      if(polling)return;
      polling=true;
      void read(transport.state).catch(err => alive.current && setError(connectionError(err))).finally(()=>{polling=false;});
    };
    read(() => transport.session({panel:true})).catch(err => alive.current && setError(connectionError(err)));
    update();
    const poll = setInterval(update, 3000);
    const timer = setInterval(() => setNow(anchor.current.server + performance.now() - anchor.current.local), 1000);
    return () => {alive.current = false;clearInterval(poll);clearInterval(timer);void transport.session({panel:false}).catch(() => {});};
  }, [transport]);
  const run = async (action: () => Promise<State>) => {
    const refreshing = action===transport.refresh;
    if(refreshing)setBusy(true);
    try {
      const result = await action();
      apply(pendingSaves.current && current.current ? {...result,settings:current.current.settings} : result);
    } catch (err) {setError(connectionError(err));}
    finally {if(refreshing)setBusy(false);}
  };
  // Keep focusable controls mounted and enabled while saving. Serialize writes so
  // rapid controller presses cannot overwrite each other or flash old poll data.
  const save = (values: Partial<Settings>) => {
    if (!current.current) return Promise.resolve();
    revision.current += 1;
    pendingSaves.current += 1;
    const optimistic = {...current.current, settings:{...current.current.settings,...values}};
    current.current = optimistic;
    setState(optimistic);
    setError(undefined);
    const task = saveQueue.current.then(async () => {
      try {
        const confirmed = await transport.save(values);
        if(pendingSaves.current===1)apply(confirmed);
      } catch {
        if(pendingSaves.current===1){
          try {apply(await transport.state());} catch {}
        }
        if(alive.current)setError('Could not save this change. Please try again.');
      } finally {pendingSaves.current -= 1;}
    });
    saveQueue.current = task;
    return task;
  };
  const {Button, Group, Toggle, Choice} = controls;
  const back = () => setView(view==='tracking'?'settings':baseView);
  const s = state?.settings;
  const conditions = state?.data?.conditions || [];
  const toggleCondition = (key: string) => {
    if (!s) return;
    const subscriptions = s.allConditions ? Object.fromEntries(conditions.map(c => [c.id, [] as string[]])) : {...s.subscriptions};
    if (key in subscriptions) delete subscriptions[key]; else subscriptions[key] = [];
    void save({allConditions:false, subscriptions});
  };
  const events = state?.data?.events.filter(e => s?.region && e.times[s.region] && e.times[s.region]![1] > now && (!trackedOnly || isTracked(s, e)) && (map === 'All maps' || map === e.map)).sort((a,b) => a.times[s!.region!]![0] - b.times[s!.region!]![0]) || [];
  const active = events.filter(e => e.times[s!.region!]![0] <= now);
  const upcoming = events.filter(e => e.times[s!.region!]![0] > now);
  const rows = (list: Event[], live: boolean, limit: number) => list.length ? list.slice(0,limit).map((e,i) => {
    const c = conditions.find(c => c.id === e.conditionId);
    const [start,end] = e.times[s!.region!]!;
    return <Group className={`orb-row ${live ? 'orb-live' : ''}`} key={`${e.conditionId}-${e.map}-${start}-${i}`}>
      <ConditionIcon condition={c}/><div className="orb-details"><div className="orb-name">{c?.name || e.conditionId}</div><div className="orb-map">{e.map}</div></div>
      <div className="orb-time"><small>{live?'ENDS IN':'STARTS IN'}</small><strong>{formatCountdown((live?end:start)-now)}</strong>{view==='schedule' && <small>{time(start)}–{time(end)}</small>}</div>
      <Button className={`orb-star ${isTracked(s!,e)?'selected':''}`} label={`${isTracked(s!,e)?'Untrack':'Track'} ${c?.name}`} onClick={() => toggleCondition(e.conditionId)} disabled={busy}>{isTracked(s!,e)?'★':'☆'}</Button>
    </Group>;
  }) : <div className="orb-empty">{!s?.region ? 'Choose your server region first.' : trackedOnly ? 'No matching conditions. Adjust your tracking choices.' : live ? 'No active conditions in this region.' : 'No upcoming conditions in the published schedule.'}</div>;
  const setting = (label: string, hint: string, key: keyof Settings) => Toggle ? <Toggle label={label} description={hint} checked={!!s?.[key]} disabled={busy} onChange={value=>{void save({[key]:value});}}/> : <div className="orb-setting"><div className="orb-flex"><span>{label}</span><Button label={`${label}: ${s?.[key]?'On':'Off'}`} className={s?.[key]?'selected':''} disabled={busy} onClick={() => save({[key]:!s?.[key]})}>{s?.[key]?'On':'Off'}</Button></div><p>{hint}</p></div>;
  const regionChoice = Choice ? <Choice label="Server region" description="Choose your in-game server." value={s?.region ?? null} options={Object.entries(REGIONS).map(([value,label])=>({value,label}))} disabled={busy} onChange={value=>{void save({region:value as Region});}}/> : <Group className="orb-region-options">{Object.entries(REGIONS).map(([key,label]) => <Button key={key} className={s?.region===key?'selected':''} disabled={busy} onClick={() => save({region:key as Region})}><span>{label}</span><span className="orb-selection-mark" aria-hidden="true">{s?.region===key?'●':'○'}</span></Button>)}</Group>;
  if(!state || !s?.region) return <Group className={`orbiter orb-setup ${baseView==='schedule'?'orb-wide':''}`}>
    <style>{controls.native?nativeStyles:styles}</style>
    {!controls.native && <div className="orb-head"><div className="orb-brand"><span className="orb-symbol">◎</span><h1>Orbiter</h1></div></div>}
    {state ? <>
      <h2 className="orb-setup-title">Choose your server region</h2>
      <p className="orb-subtitle">Select the region you use in ARC Raiders. We’ll remember it on this device.</p>
      {regionChoice}
      <p className="orb-small" style={{marginTop:16}}>You can change this later in Settings. Times display in your local timezone.</p>
    </> : <div className="orb-empty">{error?'Could not connect to Orbiter.':'Connecting to Orbiter…'}<p className="orb-small">Frontend v0.1.6</p>{!error && <Button onClick={() => run(transport.state)}>Check connection</Button>}</div>}
    {error && <div className="orb-message">{error}<Button onClick={() => run(transport.state)}>Retry</Button></div>}
  </Group>;
  return <Group className={`orbiter ${baseView==='schedule'?'orb-wide':''}`} onBack={view!==baseView?back:undefined}>
    <style>{controls.native?nativeStyles:styles}</style>
    <span ref={viewAnchor} aria-hidden="true"/>
    {view==='tracking' ? <>
      <Group className="orb-page-head"><Button className="orb-back" label="Back to Settings" onClick={back}>{controls.native?'←':'← Settings'}</Button><h1>Conditions</h1></Group><p className="orb-subtitle">Choose what to track and on which maps.</p>
      <div className="orb-section">{state.data && <p className="orb-subtitle">Selecting all includes future conditions.</p>}
        {state.data && <Button className={s?.allConditions?'selected':''} disabled={busy} onClick={() => save({allConditions:!s?.allConditions})}>{s?.allConditions?'✓ All conditions selected':'Select all conditions'}</Button>}
        {!state.data && <div className="orb-empty"><p>Load the official schedule to choose conditions and maps.</p><Button disabled={busy || state.refreshing} onClick={() => run(transport.refresh)}>{busy || state.refreshing?'Loading…':'Load schedule'}</Button></div>}
        <div className="orb-condition-list">{conditions.map(c => {
          const tracked = !!s && (s.allConditions || c.id in s.subscriptions);
          const maps = s?.allConditions ? [] : s?.subscriptions[c.id] || [];
          return <div className={`orb-condition-choice ${expanded===c.id?'expanded':''}`} key={c.id}>
          <Group className="orb-condition-heading"><Button className={`orb-condition-toggle ${tracked?'selected':''}`} label={`${tracked?'Untrack':'Track'} ${c.name}`} disabled={busy} onClick={() => toggleCondition(c.id)}><ConditionIcon condition={c}/><span className="orb-condition-copy"><span className="orb-choice-name">{c.name}</span><span className="orb-choice-summary">{!tracked?'Not tracked':!maps.length?'All maps':maps.length===1?maps[0]:`${maps.length} maps`}</span></span><span className="orb-selection-mark" aria-hidden="true">{tracked?'✓':'+'}</span></Button><Button className="orb-map-expander" label={`${expanded===c.id?'Close':'Map'} choices for ${c.name}`} onClick={() => setExpanded(expanded===c.id?undefined:c.id)}><Chevron open={expanded===c.id}/></Button></Group>
          {expanded===c.id && <Group className="orb-map-options"><h2>Maps to track</h2><p className="orb-small">Maps observed in the official schedule. All maps includes future additions.</p>{['All maps',...(c.maps ?? [...new Set(state?.data?.events.filter(e => e.conditionId===c.id).map(e => e.map))].sort())].map(m => {
            const chosen = s?.allConditions ? [] : s?.subscriptions[c.id] || [];
            const selected = s?.allConditions || c.id in (s?.subscriptions || {});
            return <Button key={m} className={selected && (m==='All maps'?!chosen.length:chosen.includes(m))?'selected':''} disabled={busy} onClick={() => {
              const subscriptions = s?.allConditions ? Object.fromEntries(conditions.map(c => [c.id, [] as string[]])) : {...s?.subscriptions};
              const maps = m==='All maps'?[]:chosen.includes(m)?chosen.filter(v => v!==m):[...chosen,m];
              if (m!=='All maps' && chosen.includes(m) && !maps.length) delete subscriptions[c.id]; else subscriptions[c.id]=maps;
              void save({allConditions:false, subscriptions});
            }}><span>{m}</span><span className="orb-selection-mark" aria-hidden="true">{selected && (m==='All maps'?!chosen.length:chosen.includes(m))?'✓':'○'}</span></Button>;
          })}</Group>}
        </div>;})}</div>
      </div>
    </> : view==='settings' ? <>
      <Group className="orb-page-head"><Button className="orb-back" label="Back to schedule" onClick={back}>{controls.native?'←':'← Back'}</Button><h1>Settings</h1>{state?.supportUrl && <Button className="orb-support" onClick={() => transport.openExternal(state.supportUrl!)}>Support ↗</Button>}</Group>{!controls.native && <p className="orb-subtitle">Your schedule. Your interruptions.</p>}
      <div className="orb-setting">{Choice ? <Choice label="Activity" description={s?.mode==='auto'?'While ARC Raiders runs, or this panel is open.':s?.mode==='always'?'While Decky runs. Other-game alerts are opt-in.':'While this panel is open.'} value={s?.mode ?? 'auto'} options={[{value:'auto',label:'Gaming'},{value:'always',label:'Always'},{value:'panel',label:'Panel'}]} onChange={mode=>{void save({mode:mode as Settings['mode']});}}/> : <><h2>Activity</h2><div className="orb-options">{(['auto','always','panel'] as const).map(mode => <Button key={mode} className={s?.mode===mode?'selected':''} disabled={busy} onClick={() => save({mode})}>{({auto:'Gaming',always:'Always',panel:'Panel'})[mode]}</Button>)}</div><p>{s?.mode==='auto'?'Track while ARC Raiders is running. Opening the panel still checks the schedule when the game is closed.':s?.mode==='always'?'Track while Decky is running. Alerts in other games need a separate opt-in.':'Track and notify only while this view is open.'}</p></>}</div>
      {setting('Notifications','Reminders for selected conditions.','notifications')}
      {s?.notifications && <div className="orb-notification-details">
      <div className="orb-setting">{Choice ? <Choice label="Advance reminder" value={s?.leadMinutes ?? 5} options={[0,1,5,10,15,30,60].map(value=>({value,label:value?`${value} min`:'Off'}))} onChange={value=>{void save({leadMinutes:Number(value)});}}/> : <><div className="orb-flex"><span>Advance reminder</span><Button disabled={busy} onClick={() => save({leadMinutes: [0,1,5,10,15,30,60][([0,1,5,10,15,30,60].indexOf(s?.leadMinutes || 0)+1)%7]})}>{s?.leadMinutes?`${s.leadMinutes} min`:'Off'} ↻</Button></div><p>Press to cycle the lead time.</p></>}</div>
      {setting('At start','Notify when a condition starts.','atStart')}
      {setting('Notification sound','Silent by default.','sound')}
      {setting('Merge alerts','Group conditions starting together.','merge')}
      {s?.mode==='always' && setting('Outside ARC Raiders','Notify while the game is closed.','otherGames')}
      <div className="orb-setting">{Choice ? <Choice label="Toast duration" value={s?.toastSeconds ?? 6} options={[3,6,10,15].map(value=>({value,label:`${value} sec`}))} onChange={value=>{void save({toastSeconds:Number(value)});}}/> : <div className="orb-flex"><span>Toast duration</span><Button disabled={busy} onClick={() => save({toastSeconds: [3,6,10,15][([3,6,10,15].indexOf(s?.toastSeconds || 6)+1)%4]})}>{s?.toastSeconds || 6} sec ↻</Button></div>}</div>
      </div>}
      <div className="orb-setting"><h2>Tracked conditions</h2><p>{s?.allConditions?'All conditions, including future additions.':`${conditions.filter(c => c.id in (s?.subscriptions || {})).length} of ${conditions.length} conditions selected.`}</p><Button className="orb-manage" onClick={() => setView('tracking')}>Manage conditions →</Button></div>
      <div className="orb-setting">{Choice ? regionChoice : <><h2>Server region</h2><Button className="orb-manage orb-disclosure" label="Server region" onClick={() => setRegionExpanded(!regionExpanded)}><span className="orb-disclosure-label">{s?.region?REGIONS[s.region]:'Choose region'}</span><Chevron open={regionExpanded || !s?.region}/></Button>{(regionExpanded || !s?.region) && regionChoice}<p>Match your ARC Raiders server. Times use your local timezone.</p></>}</div>
      <div className="orb-footer"><h2>About Orbiter</h2><p className="orb-subtitle">v{state?.version || '0.1.0'} · GPLv3<br/>Unofficial companion. Schedule and condition artwork from Embark’s ARC Raiders website. Timings may change.</p><Button onClick={() => transport.openExternal('https://arcraiders.com/map-conditions')}>Official schedule ↗</Button></div>
    </> : <>
      <div className="orb-head"><div className="orb-brand"><span className="orb-symbol">◎</span><h1>{controls.native?'ARC Raiders':'Orbiter'}</h1></div><Button className="orb-icon-button" label="Settings" onClick={() => setView('settings')}>⚙</Button></div>
      <div className="orb-flex"><div className="orb-status"><span className={`orb-dot ${state?.active?'':'idle'}`}/>{state.refreshing?'Loading schedule':!state.data || state.stale?'Schedule unavailable':state?.session.muted?'Alerts muted':state?.active?'Tracking':s?.mode==='auto'?(state?.session.known?'Waiting for ARC':'Game detection unavailable'):'Paused'}</div><span className="orb-tag">{s?.region?REGIONS[s.region]:'Choose region'}</span></div>
      {(error || state?.error || state?.stale && state.data) && <div className="orb-message">{error || state?.error || 'Saved schedule is stale. Reminders are paused.'}<div style={{marginTop:8}}><Button disabled={busy || state.refreshing} onClick={() => run(transport.refresh)}>{busy || state.refreshing?'Loading…':'Retry'}</Button></div></div>}
      {state?.demo && <div className="orb-message">Demo timeline · simulated event times</div>}
      {state.data && <Group className="orb-tabs"><Button className={!trackedOnly?'selected':''} onClick={() => setTrackedOnly(false)}>{controls.native && !trackedOnly?'✓ ':''}{controls.native?'All':'All conditions'}</Button><Button className={trackedOnly?'selected':''} onClick={() => setTrackedOnly(true)}>{controls.native && trackedOnly?'✓ ':''}Tracked</Button></Group>}
      {view==='schedule' && <><h1>Map schedule</h1><p className="orb-subtitle">Local times · {s?.region ? REGIONS[s.region] : 'select a region'} · official published horizon</p><Group className="orb-filter-list">{['All maps',...(state?.data?.maps || [])].map(m => <Button key={m} className={map===m?'selected':''} onClick={() => setMap(m)}>{controls.native && map===m?'✓ ':''}{m}</Button>)}</Group></>}
      {!state && <div className="orb-empty">Connecting to Orbiter…</div>}
      {!state.data && !state.error && !error && <div className="orb-empty"><p>{state.refreshing?'Fetching official schedule…':'No saved schedule yet.'}</p><Button disabled={busy || state.refreshing} onClick={() => run(transport.refresh)}>{busy || state.refreshing?'Loading…':'Load schedule'}</Button></div>}
      {state?.data && <div className="orb-columns"><div className="orb-section"><div className="orb-section-head"><h2>Now active</h2><span>{active.length}</span></div>{rows(active,true,view==='schedule'?1000:6)}</div><div className="orb-section"><div className="orb-section-head"><h2>Coming up</h2><span>{view==='schedule'?upcoming.length:'Next '+Math.min(3,upcoming.length)}</span></div>{rows(upcoming,false,view==='schedule'?1000:3)}</div></div>}
      <div className="orb-footer">{state.data && view==='panel' && <Button onClick={() => openSchedule?openSchedule():setView('schedule')}>View full schedule →</Button>}{view==='schedule' && baseView==='panel' && <Button onClick={() => setView('panel')}>← Compact view</Button>}
        {state.data && <Group className="orb-flex"><Button className={state?.session.muted?'selected':''} disabled={busy} onClick={() => run(() => transport.session({muted:!state?.session.muted}))}>{state?.session.muted?'Resume alerts':controls.native?'Mute alerts':'Mute this session'}</Button><Button disabled={busy} label="Refresh official schedule" onClick={() => run(transport.refresh)}>↻</Button></Group>}
        <div className="orb-footnote"><span>Official ARC Raiders schedule</span><span>{state?.data?`Updated ${time(state.data.obtainedAt)}`:''}</span></div>
      </div>
    </>}
    {(view==='settings' || view==='tracking') && (error || state.error) && <div className="orb-message">{error || state.error}</div>}
  </Group>;
}
