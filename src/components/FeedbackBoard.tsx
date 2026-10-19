import React, { useEffect, useState } from 'react';
import { MessageSquarePlus, X, Send, CheckCircle2, Clock3, Copy, Trash2, User } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { storageGet, storageSet, copyText } from '../utils/browserCompat';

export interface FeedbackNote {
  id: string;
  author: string;
  role: 'creator' | 'guest' | 'boss';
  message: string;
  category: 'Bug' | 'UX' | 'Content' | 'Feature' | 'Praise' | 'Other';
  createdAt: string;
  status: 'Open' | 'In Progress' | 'Done';
}

const STORAGE_KEY = 'opay_cdl_feedback_board_v1';

interface FeedbackBoardProps {
  isCreator: boolean;
  currentUserName: string;
  onClose: () => void;
}

export const FeedbackBoard: React.FC<FeedbackBoardProps> = ({
  isCreator,
  currentUserName,
  onClose,
}) => {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackNote['category']>('UX');
  const [authorOverride, setAuthorOverride] = useState('');

  useEffect(() => {
    try {
      const raw = storageGet(STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      setNotes([]);
    }
  }, []);

  const persist = (next: FeedbackNote[]) => {
    setNotes(next);
    storageSet(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const note: FeedbackNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: authorOverride.trim() || currentUserName || 'Guest',
      role: isCreator ? 'creator' : authorOverride.toLowerCase().includes('boss') ? 'boss' : 'guest',
      message: message.trim(),
      category,
      createdAt: new Date().toLocaleString(),
      status: 'Open',
    };

    soundManager.playCollect(1.2);
    persist([note, ...notes]);
    setMessage('');
    setAuthorOverride('');
  };

  const updateStatus = (id: string, status: FeedbackNote['status']) => {
    if (!isCreator) return;
    persist(notes.map((n) => (n.id === id ? { ...n, status } : n)));
  };

  const removeNote = (id: string) => {
    if (!isCreator) return;
    persist(notes.filter((n) => n.id !== id));
  };

  const copyAll = async () => {
    const text = notes
      .map(
        (n, i) =>
          `${i + 1}. [${n.status}] (${n.category}) ${n.author} — ${n.createdAt}\n${n.message}`
      )
      .join('\n\n');
    const ok = await copyText(text || 'No feedback yet.');
    alert(ok ? 'Feedback copied. Paste into WhatsApp / Email for your records.' : 'Copy failed on this browser. Please screenshot the notes.');
  };

  const openCount = notes.filter((n) => n.status !== 'Done').length;

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl w-full max-w-2xl modal-card shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Feedback &amp; Improvement Board</h3>
              <p className="text-xs text-neutral-400">
                Boss &amp; field users leave notes → Creator tracks and ships fixes
                {openCount > 0 ? (
                  <span className="ml-2 text-amber-300 font-semibold">• {openCount} open</span>
                ) : null}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Submit form */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-neutral-800 space-y-2.5 bg-neutral-950/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">Your name (optional)</label>
              <input
                type="text"
                placeholder={currentUserName || 'e.g. Boss / SM Lagos'}
                value={authorOverride}
                onChange={(e) => setAuthorOverride(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackNote['category'])}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option>UX</option>
                <option>Bug</option>
                <option>Content</option>
                <option>Feature</option>
                <option>Praise</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1">Feedback note</label>
            <textarea
              rows={3}
              placeholder="What should change? e.g. 'Make the tier table clearer' or 'Add more refinance scenarios'..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-neutral-500 leading-snug">
              Tip: after deploy, ask your boss to open as <strong className="text-neutral-300">Play as Guest</strong> and leave notes here. You log in as Creator to mark them Done.
            </p>
            <button
              type="submit"
              disabled={!message.trim()}
              className="shrink-0 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 text-xs font-black cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          </div>
        </form>

        {/* Notes list */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 modal-card-body min-h-0">
          {notes.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">
              No feedback yet. Share the live link and ask your boss to drop the first note.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-xl border ${
                  note.status === 'Done'
                    ? 'bg-neutral-950/50 border-neutral-800 opacity-70'
                    : note.status === 'In Progress'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{note.author}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-semibold">
                      {note.category}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        note.status === 'Done'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : note.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {note.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 shrink-0 flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {note.createdAt}
                  </span>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed mb-2">{note.message}</p>

                {isCreator && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => updateStatus(note.id, 'Open')}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 cursor-pointer"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => updateStatus(note.id, 'In Progress')}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] text-amber-300 cursor-pointer"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(note.id, 'Done')}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] text-emerald-300 cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </button>
                    <button
                      onClick={() => removeNote(note.id)}
                      className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-[10px] text-rose-300 cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
          <button
            onClick={copyAll}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            Copy all feedback
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
