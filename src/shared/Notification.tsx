import { ConditionIcon } from './ConditionIcon';
import type { Notice } from './types';

export function notificationContent(notice:Notice) {
  const items = notice.items || [];
  const sameCondition = items.length>0 && items.every(item=>item.conditionId===items[0].conditionId);
  return {
    title:notice.title,
    icon:sameCondition?<ConditionIcon condition={items[0]} size={24}/>:<span aria-hidden="true">◎</span>,
    body:items.length>1 && !sameCondition ? <div style={{display:'flex',flexDirection:'column',gap:4}}>{items.map((item,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,lineHeight:'18px',fontSize:13}}><ConditionIcon condition={item} size={16}/><span>{item.name} · {item.map}</span></div>)}</div> : notice.body,
  };
}
