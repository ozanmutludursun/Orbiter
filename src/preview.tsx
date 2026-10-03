import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OrbiterApp } from './shared/App';
import type { Controls, Notice, State, Transport } from './shared/types';

async function api<T>(path: string, values?: unknown): Promise<T> {
  const response = await fetch('/api/'+path, values===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
  if (!response.ok) throw new Error('Preview service failed');
  return response.json() as Promise<T>;
}
let panelVisible = false;
const transport: Transport = {state:()=>api('state'),save:values=>api('settings',values),session:values=>{if(values.panel!==undefined)panelVisible=values.panel;return api('session',{...values,panel:panelVisible});},refresh:()=>api('refresh',{}),openExternal:url=>window.open(url,'_blank','noopener,noreferrer')};
const controls: Controls = {
  Button: ({children,onClick,className,disabled,label}) => <button className={'orb-button '+(className || '')} disabled={disabled} onClick={onClick} aria-label={label}>{children}</button>,
  Group: ({children,className,onBack}) => <div className={className} onKeyDown={e => {if(e.key==='Escape' && onBack){onBack();e.stopPropagation();}}}>{children}</div>
};
const previewStyles = `
html,body,#root{margin:0;min-height:100%;background:#101719;color:#e5dfd2;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}button{font:inherit;cursor:pointer}.preview-header{padding:24px 36px;display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #ffffff0e}.preview-wordmark{font-size:19px;letter-spacing:-.04em;font-weight:600}.preview-label{font-size:10px;letter-spacing:.13em;color:#8e9894;text-transform:uppercase}.preview-tools{display:flex;gap:8px;flex-wrap:wrap}.preview-tools button{background:#202a2d;border:1px solid #ffffff18;color:#ddd8cd;border-radius:7px;padding:7px 11px;font-size:12px}.preview-tools button.on{border-color:#d5a67b;color:#edbd96}.preview-body{padding:40px;max-width:1320px;margin:auto}.preview-intro{display:flex;gap:28px;justify-content:space-between;align-items:end;margin-bottom:26px}.preview-intro h1{font-size:32px;font-weight:500;letter-spacing:-.04em;margin:4px 0}.preview-intro p{font-size:13px;color:#94a19c;margin:0;max-width:480px}.preview-hint{font-size:11px;color:#81918b}.preview-stage{height:800px;position:relative;overflow:hidden;border:1px solid #ffffff14;border-radius:12px;background:radial-gradient(ellipse at 23% 35%,#6d746536,transparent 52%),linear-gradient(140deg,#283836,#11191b 66%);box-shadow:0 24px 65px #0005;display:flex;justify-content:flex-end}.preview-world{position:absolute;inset:0;overflow:hidden;background:linear-gradient(0deg,#182323aa,transparent);pointer-events:none}.preview-world:before{content:'';position:absolute;inset:40% 30% -20% -20%;background:linear-gradient(135deg,#3e5149 0%,#263531 55%);clip-path:polygon(0% 75%,15% 34%,31% 38%,38% 11%,54% 26%,63% 0%,85% 40%,100% 72%,100% 100%,0 100%)}.preview-world:after{content:'';position:absolute;width:320px;height:320px;border:1px solid #b7c4a220;box-shadow:0 0 0 80px #b7c4a206,0 0 0 160px #b7c4a203;border-radius:50%;left:17%;top:14%}.preview-game-caption{position:absolute;left:38px;bottom:40px;color:#bec9b0aa;font-size:11px;letter-spacing:.18em}.preview-panel{position:relative;width:360px;overflow-y:auto;background:#1c2427;box-shadow:-20px 0 70px #0004}.preview-stage.wide{height:800px}.preview-stage.wide .preview-panel{width:100%}.preview-toast{position:absolute;bottom:28px;right:382px;background:#25332e;border:1px solid #d4b88f66;border-radius:9px;padding:16px;max-width:310px;box-shadow:0 6px 24px #0007;z-index:3}.preview-toast small{color:#b3c1b1;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.preview-toast strong{display:block;margin:5px 0;font-size:13px}.preview-toast p{font-size:12px;white-space:pre-line;margin:0;color:#cbcbbb}.preview-under{display:flex;justify-content:space-between;margin-top:14px;font-size:11px;color:#82918b}.preview-error{color:#efb58e;padding:10px 0}@media(max-width:760px){.preview-header{padding:18px;display:block}.preview-tools{margin-top:12px}.preview-body{padding:18px}.preview-intro{display:block}.preview-hint{margin-top:12px}.preview-stage{height:750px}.preview-panel{width:100%}.preview-toast{right:18px;bottom:18px}.preview-game-caption{display:none}.preview-under{display:block}}
`;
function Preview() {
  const [running,setRunning] = useState(true);
  const [demo,setDemo] = useState(false);
  const [wide,setWide] = useState(false);
  const [visible,setVisible] = useState(true);
  const [notice,setNotice] = useState<Notice>();
  const [error,setError] = useState('');
  useEffect(() => {
    const heartbeat = () => transport.session({running,known:true}).catch(()=>{});
    heartbeat();const timer = setInterval(heartbeat,10_000);return()=>clearInterval(timer);
  },[running]);
  useEffect(() => {
    const timer = setInterval(async()=> {try {const items=await api<Notice[]>('notifications');if(items.length)setNotice(items[items.length-1]);}catch{}},1000);
    return()=>clearInterval(timer);
  },[]);
  useEffect(()=> {if(!notice)return;const timer=setTimeout(()=>setNotice(undefined),notice.seconds*1000);return()=>clearTimeout(timer);},[notice]);
  const toggleDemo = async () => {try {const s=await api<State>('demo',{enabled:!demo});setDemo(s.demo);setError('');}catch{setError('Load the official schedule first, then enable demo mode.');}};
  return <><style>{previewStyles}</style><header className="preview-header"><div><div className="preview-wordmark">◎ Orbiter</div><div className="preview-label">Local preview · v0.1</div></div><div className="preview-tools"><button className={running?'on':''} onClick={()=>setRunning(!running)}>{running?'● ARC running':'○ ARC closed'}</button><button className={demo?'on':''} onClick={toggleDemo}>{demo?'Demo timeline':'Live schedule'}</button><button onClick={()=>setWide(!wide)}>{wide?'Compact panel':'Wide view'}</button><button onClick={()=>setVisible(!visible)}>{visible?'Close panel':'Open panel'}</button></div></header>
  <main className="preview-body"><div className="preview-intro"><div><div className="preview-label">A quieter companion</div><h1>Stay in the raid.</h1><p>Map conditions, a glance away. This preview uses the plugin’s actual interface and schedule engine.</p></div><div className="preview-hint">Keyboard & mouse · Tab to focus · Esc to return<br/>Steam game detection and toasts are simulated here.</div></div>{error && <div className="preview-error">{error}</div>}
  <div className={`preview-stage ${wide?'wide':''}`}><div className="preview-world"/><div className="preview-game-caption">SIMULATED GAME BACKDROP / 1280 × 800</div>{visible && <div className="preview-panel"><OrbiterApp transport={transport} controls={controls} layout={wide?'schedule':'panel'} openSchedule={()=>setWide(true)}/></div>}{notice && <div className="preview-toast" role="status" style={!visible?{right:28}:undefined}><small>Simulated Steam toast{notice.sound?' · sound enabled':''}</small><strong>{notice.title}</strong><p>{notice.body}</p></div>}</div>
  <div className="preview-under"><span>Official names & artwork. Demo mode changes event times only.</span><span>SteamOS Gaming Mode is the primary target.</span></div></main></>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
