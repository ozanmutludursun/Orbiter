import { definePlugin, callable, addEventListener, removeEventListener, routerHook, toaster } from '@decky/api';
import { DialogButton, Focusable, Navigation, PanelSection, Router, ToggleField, useQuickAccessVisible } from '@decky/ui';
import { useEffect, useState } from 'react';
import { OrbiterApp } from './shared/App';
import { Chevron } from './shared/Chevron';
import { backendRequest } from './shared/backendRequest';
import type { Controls, Notice, Session, Settings, State, Transport } from './shared/types';

const getState = () => backendRequest(() => callable<[],State>('get_state')());
const save = (settings:Partial<Settings>) => backendRequest(() => callable<[Partial<Settings>],State>('save_settings')(settings));
const session = (values:Partial<Session>) => backendRequest(() => callable<[Partial<Session>],State>('session')(values), 20000);
const refresh = () => backendRequest(() => callable<[],State>('refresh')(), 20000);
const ROUTE = '/orbiter/schedule';
let panelOpen = false;
let routeOpen = false;
let game = {running:false, known:false};
const heartbeat = () => session({...game,panel:panelOpen || routeOpen}).catch(()=>{});
const transport: Transport = {state:getState, save, session: values => {
  if ('panel' in values) {void heartbeat();return getState();}
  return session(values);
},refresh,openExternal:url=>Navigation.NavigateToExternalWeb(url)};
const InlineChoice: NonNullable<Controls['Choice']> = ({label,description,value,options,onChange,disabled}) => {
  const [open,setOpen] = useState(false);
  const selected = options.find(option=>option.value===value);
  return <Focusable className="orb-inline-choice" flow-children="column" onCancel={open?event=>{event.stopPropagation();setOpen(false);}:undefined}>
    <h2>{label}</h2>
    {description && <p className="orb-subtitle">{description}</p>}
    <DialogButton className="orb-button orb-inline-choice-trigger" disabled={disabled} onClick={()=>setOpen(!open)} onOKActionDescription={open?'Close choices':'Choose'}>
      <span>{selected?.label || 'Choose region'}</span><Chevron open={open}/>
    </DialogButton>
    {open && <Focusable className="orb-inline-choice-options" flow-children="column">
      {options.map(option=><DialogButton key={option.value} className="orb-button orb-inline-choice-option" disabled={disabled} onClick={()=>{onChange(option.value);setOpen(false);}} onOKActionDescription="Select">
        <span>{option.label}</span><span aria-hidden="true">{value===option.value?'✓':'○'}</span>
      </DialogButton>)}
    </Focusable>}
  </Focusable>;
};
const controls: Controls = {
  native:true,
  Toggle:props=><ToggleField {...props} childrenContainerWidth="min"/>,
  Choice:InlineChoice,
  Button:({children,onClick,className,disabled,label})=><DialogButton className={'orb-button '+(className || '')} disabled={disabled} onClick={onClick} onOKActionDescription={label}>{children}</DialogButton>,
  Group:({children,className,onBack})=>className?.split(' ').includes('orbiter')
    ? <div className={className}><PanelSection><Focusable onCancel={onBack} style={{display:'contents'}} flow-children="column">{children}</Focusable></PanelSection></div>
    : <Focusable className={className} onCancel={onBack} flow-children={/orb-flex|orb-row|orb-tabs|orb-filter-list|orb-condition-heading|orb-page-head/.test(className || '')?'row':'column'}>{children}</Focusable>
};
function Content(){
  const visible = useQuickAccessVisible();
  useEffect(()=>{panelOpen=visible;void heartbeat();return()=>{panelOpen=false;void heartbeat();};},[visible]);
  return <OrbiterApp transport={transport} controls={controls} openSchedule={()=>{Navigation.Navigate(ROUTE);Navigation.CloseSideMenus();}}/>;
}
function Schedule(){
  useEffect(()=>{routeOpen=true;void heartbeat();return()=>{routeOpen=false;void heartbeat();};},[]);
  return <Focusable onCancel={()=>Navigation.NavigateBack()} style={{height:'100%',overflowY:'auto'}}><OrbiterApp transport={transport} controls={controls} initialView="schedule"/></Focusable>;
}
function readGame(){
  try {const apps=Router.RunningApps;if(Array.isArray(apps)) game={running:apps.some(a=>Number(a.appid)===1808500),known:true};else game={running:false,known:false};}
  catch {game={running:false,known:false};}
}
export default definePlugin(()=>{
  readGame();void heartbeat();
  let unregister: (()=>void)|undefined;
  try {const subscription=window.SteamClient.GameSessions.RegisterForAppLifetimeNotifications(event=>{if(event.unAppID===1808500){game={running:event.bRunning,known:true};void heartbeat();}});unregister=()=>subscription.unregister();}catch{}
  const timer=setInterval(()=>{readGame();void heartbeat();},10_000);
  const listener=addEventListener<[Notice]>('orbiter_notification',notice=>toaster.toast({title:notice.title,body:notice.body,duration:notice.seconds*1000,playSound:notice.sound}));
  routerHook.addRoute(ROUTE,Schedule);
  return {name:'Orbiter',titleView:<div style={{fontWeight:600}}>Orbiter</div>,content:<Content/>,icon:<span>◎</span>,onDismount(){clearInterval(timer);unregister?.();removeEventListener('orbiter_notification',listener);routerHook.removeRoute(ROUTE);panelOpen=false;routeOpen=false;void session({running:false,known:false,panel:false});}};
});
