import { useState } from 'react';
import { Chevron } from './Chevron';
import type { Controls } from './types';

// The preview and Deck use the same disclosure behavior. Only the controls differ.
export function createInlineChoice({Button,Group}: Pick<Controls,'Button'|'Group'>): NonNullable<Controls['Choice']> {
  return function InlineChoice({label,description,value,options,onChange,disabled}) {
    const [open,setOpen] = useState(false);
    const selected = options.find(option=>option.value===value);
    return <Group className="orb-inline-choice" onBack={open?()=>setOpen(false):undefined}>
      <h2>{label}</h2>
      {description && <p className="orb-small">{description}</p>}
      <Button className="orb-inline-choice-trigger" disabled={disabled} label={`${label}: ${selected?.label || 'Select region'}`} actionDescription={open?'Close':'Choose'} expanded={open} onClick={()=>setOpen(!open)}>
        <span>{selected?.label || 'Select region'}</span><Chevron open={open}/>
      </Button>
      {open && <Group className="orb-inline-choice-options">
        {options.map(option=><Button key={option.value} className="orb-inline-choice-option" disabled={disabled} label={option.label} actionDescription="Select" pressed={value===option.value} onClick={()=>{onChange(option.value);setOpen(false);}}>
          <span>{option.label}</span><span aria-hidden="true">{value===option.value?'✓':'○'}</span>
        </Button>)}
      </Group>}
    </Group>;
  };
}
