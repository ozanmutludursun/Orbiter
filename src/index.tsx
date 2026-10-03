import { definePlugin, callable, addEventListener, removeEventListener, routerHook, toaster } from '@decky/api';
import { DialogButton, Focusable, Navigation, Router, useQuickAccessVisible } from '@decky/ui';
import { useEffect } from 'react';
import { OrbiterApp } from './shared/App';
import type { Controls, Notice, Session, Settings, State, Transport } from './shared/types';

async function backend<T>(request: Promise<T>, timeout = 8000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([request, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Orbiter backend did not respond. Try reloading the plugin.')), timeout);
    })]);
  } finally {clearTimeout(timer!);}
}
const getState = () => backend(callable<[],State>('get_state')());
const save = (settings:Partial<Settings>) => backend(callable<[Partial<Settings>],State>('save_settings')(settings));
const session = (values:Partial<Session>) => backend(callable<[Partial<Session>],State>('session')(values), 20000);
const refresh = () => backend(callable<[],State>('refresh')(), 20000);
const ROUTE = '/orbiter/schedule';
let panelOpen = false;
let routeOpen = false;
let game = {running:false, known:false};
const heartbeat = () => session({...game,panel:panelOpen || routeOpen}).catch(()=>{});
const transport: Transport = {state:getState, save, session: values => {
  if ('panel' in values) {void heartbeat();return getState();}
  return session(values);
},refresh,openExternal:url=>Navigation.NavigateToExternalWeb(url)};
const controls: Controls = {
  Button:({children,onClick,className,disabled,label})=><DialogButton className={'orb-button '+(className || '')} disabled={disabled} onClick={onClick} onOKActionDescription={label}>{children}</DialogButton>,
  Group:({children,className,onBack})=>className?.split(' ').includes('orbiter')
    ? <div className={className}><Focusable onCancel={onBack} style={{display:'contents'}} flow-children="column">{children}</Focusable></div>
    : <Focusable className={className} onCancel={onBack} flow-children={/orb-flex|orb-row|orb-tabs|orb-filter-list|orb-condition-heading/.test(className || '')?'row':'column'}>{children}</Focusable>
};
function Content(){
  const visible = useQuickAccessVisible();
  useEffect(()=>{panelOpen=visible;void heartbeat();return()=>{panelOpen=false;void heartbeat();};},[visible]);
  return <OrbiterApp transport={transport} controls={controls} openSchedule={()=>{Navigation.Navigate(ROUTE);Navigation.CloseSideMenus();}}/>;
}
function Schedule(){
  useEffect(()=>{routeOpen=true;void heartbeat();return()=>{routeOpen=false;void heartbeat();};},[]);
  return <Focusable onCancel={()=>Navigation.NavigateBack()} style={{height:'100%',overflowY:'auto',background:'#1c2427'}}><OrbiterApp transport={transport} controls={controls} initialView="schedule"/></Focusable>;
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
