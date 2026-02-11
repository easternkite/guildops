'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

type FeedbackItem = {
  id: string;
  path: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = 'guildops-feedback-v1';

export function FeedbackCapture() {
  const pathname = usePathname();
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const entry: FeedbackItem = {
      id: crypto.randomUUID(),
      path: pathname,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };

    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as FeedbackItem[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...prev].slice(0, 200)));

    setMessage('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <section className="feedback-panel" aria-label="feedback-capture">
      <form className="feedback-form" onSubmit={submit}>
        <label htmlFor="feedback-input">실사용 피드백</label>
        <input
          id="feedback-input"
          placeholder={`현재 화면(${pathname})에 대한 피드백을 남겨주세요`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">저장</button>
        {saved ? <span className="feedback-saved">저장됨(local)</span> : null}
      </form>
    </section>
  );
}
