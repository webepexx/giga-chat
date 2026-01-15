'use client';

import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// We use dynamic import to prevent SSR errors
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// Inside components/ui/emoji-input.tsx
export default function EmojiInput({ value, onChange, disabled }: any) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <button disabled={disabled} onClick={() => setShow(!show)} type="button"><Smile/></button>
        {show && (
          <div className="absolute bottom-full right-0 z-50">
            <Picker onEmojiClick={(emoji) => {
              onChange(value + emoji.emoji);
              // setShow(false); 
            }} />
          </div>
        )}
      </div>
    );
  }