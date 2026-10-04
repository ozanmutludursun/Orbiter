import type { ComponentType, ReactNode } from 'react';
export const REGIONS = {'europe': 'Europe', 'north-america': 'North America', 'brazil': 'South America', 'east-asia': 'Asia', 'oceania': 'Oceania'};
export type Region = keyof typeof REGIONS;
export type Settings = {region: Region | null; mode: 'auto'|'always'|'panel'; notifications: boolean; allConditions: boolean; subscriptions: Record<string, string[]>; leadMinutes: number; atStart: boolean; sound: boolean; toastSeconds: number; merge: boolean; otherGames: boolean};
export type Condition = {id: string; name: string; kind: string; icon: string | null; maps?: string[]};
export type Event = {conditionId: string; map: string; times: Partial<Record<Region, [number, number]>>};
export type Session = {running: boolean; known: boolean; panel: boolean; muted: boolean};
export type State = {settings: Settings; data: {obtainedAt: number; serverNow: number; events: Event[]; conditions: Condition[]; maps: string[]} | null; session: Session; now: number; active: boolean; stale: boolean; error: string | null; refreshing: boolean; demo: boolean; version: string; supportUrl: string | null};
export type Notice = {title: string; body: string; sound: boolean; seconds: number; items?: {conditionId:string;name:string;map:string;icon:string|null}[]};
export type Transport = {state(): Promise<State>; save(values: Partial<Settings>): Promise<State>; session(values: Partial<Session>): Promise<State>; refresh(): Promise<State>; testNotification(): Promise<void>; openExternal(url: string): void};
export type ControlProps = {children: ReactNode; onClick(): void; className?: string; disabled?: boolean; label?: string; actionDescription?: string; expanded?: boolean; pressed?: boolean; focusRef?(node: HTMLElement | null): void};
export type Controls = {
  native?: boolean;
  Button: ComponentType<ControlProps>;
  Group: ComponentType<{children: ReactNode; className?: string; onBack?(): void}>;
  Item: ComponentType<{label:ReactNode;description?:ReactNode;icon?:ReactNode;children:ReactNode}>;
  Toggle?: ComponentType<{label: string; description?: string; checked: boolean; disabled?: boolean; onChange(value: boolean): void}>;
  Choice?: ComponentType<{label: string; description?: string; value: string | number | null; options: {label: string; value: string | number}[]; disabled?: boolean; onChange(value: string | number): void}>;
};
