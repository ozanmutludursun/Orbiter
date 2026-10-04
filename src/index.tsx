import { definePlugin, callable, addEventListener, removeEventListener, routerHook, toaster } from '@decky/api';
import { DialogButton, Field, Focusable, Navigation, PanelSection, PanelSectionRow, Router, ToggleField, useQuickAccessVisible } from '@decky/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OrbiterApp } from './shared/App';
import { createInlineChoice } from './shared/InlineChoice';
import { backendRequest } from './shared/backendRequest';
import { notificationContent } from './shared/Notification';
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
},refresh,testNotification:()=>backendRequest(()=>callable<[],void>('test_notification')()),openExternal:url=>Navigation.NavigateToExternalWeb(url)};
const controls: Controls = {
  native:true,
  Toggle:props=><ToggleField {...props} childrenContainerWidth="min"/>,
  Item:({label,description,icon,children})=><PanelSectionRow><Field className="orb-native-item" label={label} description={description} icon={icon} padding="compact" bottomSeparator="standard" childrenContainerWidth="min" inlineWrap="keep-inline" verticalAlignment="center">{children}</Field></PanelSectionRow>,
  Button:({children,onClick,className,disabled,label,actionDescription,expanded,pressed,focusRef})=><DialogButton ref={focusRef} className={'orb-button '+(className || '')} disabled={disabled} onClick={onClick} aria-label={label} aria-expanded={expanded} aria-pressed={pressed} onOKActionDescription={actionDescription || label}>{children}</DialogButton>,
  Group:({children,className,onBack})=>className?.split(' ').includes('orbiter')
    ? <div className={className}>{className.split(' ').includes('orb-wide')
      ? <Focusable onCancel={onBack?event=>{event.stopPropagation();onBack();}:undefined} flow-children="column">{children}</Focusable>
      : <PanelSection><Focusable onCancel={onBack?event=>{event.stopPropagation();onBack();}:undefined} style={{display:'contents'}} flow-children="column">{children}</Focusable></PanelSection>}</div>
    : <Focusable className={className} onCancel={onBack?event=>{event.stopPropagation();onBack();}:undefined} flow-children={/orb-flex|orb-row|orb-tabs|orb-filter-list|orb-condition-actions|orb-page-head|orb-schedule-filters/.test(className || '')?'row':'column'}>{children}</Focusable>
};
controls.Choice = createInlineChoice(controls);
function Content(){
  const visible = useQuickAccessVisible();
  const anchor = useRef<HTMLDivElement>(null);
  const [bounds,setBounds] = useState<{width:number;height:number}>();
  useLayoutEffect(()=>{
    const node=anchor.current;
    if(!node || !visible)return;
    const measure=()=>{
      const rect=node.getBoundingClientRect();
      // Keep a plugin-owned viewport below Decky's sticky title; derive its
      // width rather than assuming MagicPods' fixed 300px panel width.
      const next={width:rect.width,height:Math.max(160,window.innerHeight-rect.top-56)};
      setBounds(old=>old?.width===next.width && old.height===next.height?old:next);
    };
    measure();
    const observer=new ResizeObserver(measure);observer.observe(node);
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[visible]);
  useEffect(()=>{panelOpen=visible;void heartbeat();return()=>{panelOpen=false;void heartbeat();};},[visible]);
  return <div ref={anchor} style={{height:bounds?.height}}><div className="orb-native-viewport" style={{position:bounds?'fixed':undefined,width:bounds?.width,height:bounds?.height,boxSizing:'border-box',paddingTop:8,paddingBottom:8,overflowY:'auto',overflowX:'hidden',scrollPadding:'8px 0',overscrollBehavior:'contain'}}><OrbiterApp transport={transport} controls={controls} openSchedule={()=>{Navigation.Navigate(ROUTE);Navigation.CloseSideMenus();}}/></div></div>;
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
  const listener=addEventListener<[Notice]>('orbiter_notification',notice=>toaster.toast({...notificationContent(notice),duration:notice.seconds*1000,playSound:notice.sound}));
  routerHook.addRoute(ROUTE,Schedule);
  return {name:'Orbiter',titleView:<div style={{fontWeight:600}}>Orbiter</div>,content:<Content/>,icon:<span>◎</span>,onDismount(){clearInterval(timer);unregister?.();removeEventListener('orbiter_notification',listener);routerHook.removeRoute(ROUTE);panelOpen=false;routeOpen=false;void session({running:false,known:false,panel:false});}};
});
