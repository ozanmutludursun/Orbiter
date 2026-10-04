import type { Condition } from './types';

// An image mask follows Steam's foreground colour without inserting SVG into
// the DOM. Focused icons stay readable on Steam's light button surface.
export function ConditionIcon({condition,size=24}: {condition?: Pick<Condition,'icon'>; size?:number}) {
  const mask = condition?.icon ? `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(condition.icon)}")` : undefined;
  return <span aria-hidden="true" className={mask?'orb-condition-icon':'orb-fallback'} style={{width:size,height:size,flex:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',...(mask?{backgroundColor:'currentColor',maskImage:mask,WebkitMaskImage:mask,maskSize:'contain',WebkitMaskSize:'contain',maskRepeat:'no-repeat',WebkitMaskRepeat:'no-repeat',maskPosition:'center',WebkitMaskPosition:'center'}:{})}}>{mask?null:'◇'}</span>;
}
