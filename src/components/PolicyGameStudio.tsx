import React, { useEffect, useMemo, useState } from 'react';
import {
  GameRuntimeConfig,
  GameVersionSnapshot,
  loadActiveConfig,
  saveActiveConfig,
  loadVersions,
  pushVersion,
  nowStamp,
  configFromParse,
  parsePolicyToGame,
} from '../types/gameVersioning';
import {
  GameTypeDefinition,
  GameCategory,
  CATEGORY_LABELS,
  loadGameCatalog,
  saveGameCatalog,
  upsertCreatorGameType,
  suggestGamesFromDocument,
  GameSuggestion,
} from '../types/gameCatalog';
import { soundManager } from '../utils/sound';
import {
  X,
  Sparkles,
  History,
  RotateCcw,
  Play,
  PlusCircle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Gamepad2,
  Upload,
  Star,
} from 'lucide-react';

interface PolicyGameStudioProps {
  actorRole: 'Creator' | 'DH';
  actorName: string;
  actorId?: string;
  onClose: () => void;
  onConfigActivated?: (cfg: GameRuntimeConfig) => void;
}

type StudioTab = 'recommend' | 'catalog' | 'create_type' | 'versions';

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as GameCategory[];

export const PolicyGameStudio: React.FC<PolicyGameStudioProps> = ({
  actorRole,
  actorName,
  onClose,
  onConfigActivated,
}) => {
  const isCreator = actorRole === 'Creator';
  const [tab, setTab] = useState<StudioTab>('recommend');
  const [docText, setDocText] = useState('');
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [detectSummary, setDetectSummary] = useState('');
  const [catalog, setCatalog] = useState<GameTypeDefinition[]>(() => loadGameCatalog());
  const [active, setActive] = useState<GameRuntimeConfig>(() => loadActiveConfig());
  const [versions, setVersions] = useState<GameVersionSnapshot[]>(() => loadVersions());
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(() => nowStamp().display);
  const [confirmRollback, setConfirmRollback] = useState<GameVersionSnapshot | null>(null);
  const [manualLabel, setManualLabel] = useState('');
  const [manualNote, setManualNote] = useState('');

  // Creator new game form
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCats, setNewCats] = useState<GameCategory[]>([]);
  const [newKeywords, setNewKeywords] = useState('');
  const [newBestFor, setNewBestFor] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [newMinutes, setNewMinutes] = useState(10);
  const [newIcon, setNewIcon] = useState('🎮');
  const [newColor, setNewColor] = useState('#10B981');

  useEffect(() => {
    const id = window.setInterval(() => setClock(nowStamp().display), 1000);
    return () => clearInterval(id);
  }, []);

  const analyzeDocument = () => {
    setError(null);
    setFlash(null);
    if (docText.trim().length < 24) {
      setError('Paste a fuller SOP/policy (a few sentences minimum) so recommendations are meaningful.');
      soundManager.playLoginFail();
      return;
    }
    const result = suggestGamesFromDocument(docText, loadGameCatalog());
    setSuggestions(result.suggestions);
    setDetectSummary(result.summary);
    soundManager.playUiOpen();
  };

  const snapshotBefore = (label: string, note: string) => {
    pushVersion({
      label,
      note,
      savedByRole: actorRole,
      savedByName: actorName,
      activeModeId: active.modeId,
      activePresetId: active.presetId,
      config: active,
      kind: 'auto',
    });
  };

  const activateGameType = (game: GameTypeDefinition, intent: 'upgrade' | 'start_new') => {
    const parsed = parsePolicyToGame(docText || `${game.name} ${game.description} ${game.keywords.join(' ')}`);
    // Force selected catalog game id into runtime mode
    const cfg = configFromParse(
      {
        ...parsed,
        suggestedModeId: game.id as typeof parsed.suggestedModeId,
        suggestedTitle: `${game.name} · ${game.difficultyDefault.toUpperCase()}`,
        difficulty: game.difficultyDefault,
        suggestedFocus: game.categories,
        detectedThemes: game.categories,
      },
      docText || game.description
    );
    cfg.modeId = game.id as GameRuntimeConfig['modeId'];
    cfg.title = intent === 'upgrade' ? `Upgraded · ${game.name}` : `Live · ${game.name}`;
    cfg.focus = game.categories;
    cfg.rules = [
      ...cfg.rules,
      `Catalog game: ${game.name}`,
      `Best for: ${game.bestFor.slice(0, 2).join('; ')}`,
    ];

    snapshotBefore(`Before activating ${game.name}`, `Prior config saved automatically`);
    saveActiveConfig(cfg);
    const snap = pushVersion({
      label: `${intent === 'upgrade' ? 'Upgrade' : 'Start'} → ${game.name}`,
      note: detectSummary || game.tagline,
      savedByRole: actorRole,
      savedByName: actorName,
      activeModeId: cfg.modeId,
      config: cfg,
      kind: intent === 'upgrade' ? 'policy_upgrade' : 'policy_create',
    });
    setActive(cfg);
    setVersions(loadVersions());
    onConfigActivated?.(cfg);
    setFlash(`${cfg.title} is now live · saved ${snap.savedAtDisplay}`);
    soundManager.playSubmit();
  };

  const toggleGameActive = (id: string) => {
    if (!isCreator) return;
    const list = loadGameCatalog().map((g) => (g.id === id ? { ...g, active: !g.active } : g));
    saveGameCatalog(list);
    setCatalog(list);
    soundManager.playUiTap();
  };

  const createGameType = () => {
    if (!isCreator) return;
    setError(null);
    if (!newName.trim() || !newTagline.trim() || !newDesc.trim() || newCats.length === 0) {
      setError('Name, tagline, description and at least one category are required.');
      soundManager.playLoginFail();
      return;
    }
    const created = upsertCreatorGameType(
      {
        name: newName,
        tagline: newTagline,
        description: newDesc,
        categories: newCats,
        keywords: newKeywords.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
        bestFor: newBestFor.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
        playerExperience: newExperience || 'Custom Creator mode',
        difficultyDefault: newDifficulty,
        estimatedMinutes: newMinutes,
        color: newColor,
        icon: newIcon,
        active: true,
      },
      actorName
    );
    setCatalog(loadGameCatalog());
    pushVersion({
      label: `Creator added game type: ${created.name}`,
      note: created.tagline,
      savedByRole: 'Creator',
      savedByName: actorName,
      activeModeId: active.modeId,
      config: active,
      kind: 'manual',
    });
    setVersions(loadVersions());
    setFlash(`New game type added to catalog: ${created.name}`);
    setNewName('');
    setNewTagline('');
    setNewDesc('');
    setNewCats([]);
    setNewKeywords('');
    setNewBestFor('');
    setNewExperience('');
    soundManager.playTacticsLevelUp();
    setTab('catalog');
  };

  const saveCheckpoint = () => {
    if (!manualLabel.trim()) {
      setError('Enter a checkpoint label.');
      return;
    }
    const snap = pushVersion({
      label: manualLabel.trim(),
      note: manualNote.trim() || 'Manual checkpoint',
      savedByRole: actorRole,
      savedByName: actorName,
      activeModeId: active.modeId,
      config: active,
      kind: 'manual',
    });
    setVersions(loadVersions());
    setManualLabel('');
    setManualNote('');
    setFlash(`Checkpoint saved · ${snap.savedAtDisplay}`);
    soundManager.playSubmit();
  };

  const doRollback = (v: GameVersionSnapshot) => {
    pushVersion({
      label: `Auto-save before rollback to ${v.label}`,
      note: 'Safety snapshot',
      savedByRole: actorRole,
      savedByName: actorName,
      activeModeId: active.modeId,
      config: active,
      kind: 'auto',
    });
    saveActiveConfig(v.config);
    pushVersion({
      label: `ROLLBACK → ${v.label}`,
      note: `Restored from ${v.savedAtDisplay}`,
      savedByRole: actorRole,
      savedByName: actorName,
      activeModeId: v.config.modeId,
      config: v.config,
      kind: 'rollback_restore',
    });
    setActive(v.config);
    setVersions(loadVersions());
    onConfigActivated?.(v.config);
    setConfirmRollback(null);
    setFlash(`Rolled back to “${v.label}”`);
    soundManager.playTacticsLevelUp();
  };

  const topThree = suggestions.slice(0, 3);
  const sortedVersions = useMemo(() => [...versions].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)), [versions]);

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-violet-500/30 rounded-2xl w-full max-w-5xl modal-card shadow-2xl">
        <div className="p-3 sm:p-4 border-b border-neutral-800 bg-neutral-950 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-violet-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {actorRole} · Multi-Game Platform Studio
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {isCreator ? 'Manage Game Types + Policy Recommendations' : 'Upload SOP → Get Best Game Suggestions'}
            </h3>
            <p className="text-[11px] text-neutral-400">
              Live clock <span className="text-emerald-300 font-mono">{clock}</span> · Active: <span className="text-white">{active.title}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-neutral-800 text-neutral-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 sm:px-4 pt-2 flex flex-wrap gap-2 border-b border-neutral-800">
          <Tab id="recommend" tab={tab} setTab={setTab} icon={<Upload className="w-3.5 h-3.5" />} label={isCreator ? 'Recommend' : 'Suggest Games'} />
          <Tab id="catalog" tab={tab} setTab={setTab} icon={<Gamepad2 className="w-3.5 h-3.5" />} label={`Catalog (${catalog.filter((g) => g.active).length})`} />
          {isCreator && <Tab id="create_type" tab={tab} setTab={setTab} icon={<PlusCircle className="w-3.5 h-3.5" />} label="Create Game Type" />}
          <Tab id="versions" tab={tab} setTab={setTab} icon={<History className="w-3.5 h-3.5" />} label="Versions" />
        </div>

        <div className="modal-card-body p-3 sm:p-4 space-y-3">
          {flash && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {flash}
            </div>
          )}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* RECOMMEND / DH UPLOAD */}
          {tab === 'recommend' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[11px] text-violet-100 leading-relaxed">
                {isCreator
                  ? 'Paste an SOP/policy to preview what DHs will be recommended. Creator can also build new game types in the catalog.'
                  : 'Upload/paste your SOP or policy. The platform ranks the best existing game types (from Creator catalog) for this document.'}
              </div>

              <label className="block">
                <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Paste SOP / Policy / Training document</span>
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  rows={7}
                  placeholder="Paste document text here… e.g. POS quality standards, loan disbursement SOP, warning tier exit options, CDLM coaching checklist..."
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400 min-h-[130px]"
                />
              </label>
              <button
                type="button"
                onClick={analyzeDocument}
                className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-black cursor-pointer"
              >
                Analyze Document &amp; Suggest Best Games
              </button>

              {!!detectSummary && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-100">{detectSummary}</div>
              )}

              {topThree.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Top recommended game types
                  </div>
                  {topThree.map((s) => (
                    <div key={s.game.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{s.game.icon}</span>
                            <div>
                              <div className="text-sm font-black text-white">
                                #{s.rank} {s.game.name}{' '}
                                <span className="text-emerald-300 font-mono text-xs">{s.score}%</span>
                              </div>
                              <div className="text-[11px] text-neutral-400">{s.game.tagline}</div>
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-300 mt-1.5 leading-relaxed">{s.game.description}</p>
                          <div className="text-[10px] text-neutral-500 mt-1">Best for: {s.game.bestFor.join(' · ')}</div>
                          <ul className="mt-1 text-[10px] text-neutral-400 list-disc pl-4">
                            {s.why.slice(0, 3).map((w) => (
                              <li key={w}>{w}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => activateGameType(s.game, 'start_new')}
                            className="px-3 py-2 rounded-lg bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" /> Start this game
                          </button>
                          <button
                            type="button"
                            onClick={() => activateGameType(s.game, 'upgrade')}
                            className="px-3 py-2 rounded-lg bg-neutral-800 text-emerald-300 text-xs font-bold cursor-pointer"
                          >
                            Upgrade current with this
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {suggestions.length > 3 && (
                    <details className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <summary className="text-xs font-bold text-neutral-300 cursor-pointer">All ranked options ({suggestions.length})</summary>
                      <div className="mt-2 space-y-1.5">
                        {suggestions.slice(3).map((s) => (
                          <div key={s.game.id} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-neutral-300 truncate">
                              #{s.rank} {s.game.icon} {s.game.name} · {s.score}%
                            </span>
                            <button type="button" onClick={() => activateGameType(s.game, 'start_new')} className="text-emerald-400 font-bold cursor-pointer">
                              Use
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CATALOG */}
          {tab === 'catalog' && (
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-400">
                Platform catalog starts with <strong className="text-white">7 modern game types</strong>. Creator can add more. DH only sees active games for recommendations.
              </div>
              {catalog.map((g) => (
                <div key={g.id} className={`rounded-xl border p-3 ${g.active ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-800/50 bg-neutral-950/50 opacity-70'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{g.icon}</span> {g.name}
                        {!g.modern && <span className="text-[9px] text-amber-400">legacy risk</span>}
                        {g.createdBy === 'Creator' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">Creator</span>}
                      </div>
                      <div className="text-[11px] text-neutral-400">{g.tagline}</div>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">{g.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {g.categories.map((c) => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400">
                            {CATEGORY_LABELS[c]}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        ~{g.estimatedMinutes} min · default {g.difficultyDefault} · {g.playerExperience}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button type="button" onClick={() => activateGameType(g, 'start_new')} className="px-3 py-2 rounded-lg bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer">
                        Play / Activate
                      </button>
                      {isCreator && (
                        <button type="button" onClick={() => toggleGameActive(g.id)} className="px-3 py-2 rounded-lg bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer">
                          {g.active ? 'Disable for DH' : 'Enable for DH'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CREATE TYPE — Creator only */}
          {tab === 'create_type' && isCreator && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-100 leading-relaxed">
                <strong>Modern guidance:</strong> add a new <em>game type</em> when training needs a distinct experience (rules/feel/scoring), not a tiny cosmetic clone.
                Avoid old-school “one-off random minigames” that don’t map to SOP categories — DHs won’t get good suggestions.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Field label="Game name *" value={newName} onChange={setNewName} placeholder="e.g. Rural Market Blitz" />
                <Field label="Tagline *" value={newTagline} onChange={setNewTagline} placeholder="Short punchy promise" />
              </div>
              <label className="block">
                <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Description *</span>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white" />
              </label>
              <div>
                <div className="text-[11px] font-bold text-neutral-400 mb-1.5">Categories * (used for DH suggestions)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_CATEGORIES.map((c) => {
                    const on = newCats.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCats((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
                        className={`text-left px-2 py-1.5 rounded-lg border text-[10px] cursor-pointer ${
                          on ? 'border-violet-400 bg-violet-500/15 text-violet-200' : 'border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {on ? '✓ ' : ''}{CATEGORY_LABELS[c]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Keywords (comma-separated)" value={newKeywords} onChange={setNewKeywords} placeholder="loan, rural, footfall, sprint" />
              <Field label="Best for (comma-separated)" value={newBestFor} onChange={setNewBestFor} placeholder="Rural SOP refreshers, weekend competitions" />
              <Field label="Player experience" value={newExperience} onChange={setNewExperience} placeholder="What it feels like to play" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Difficulty</span>
                  <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as 'easy' | 'normal' | 'hard')} className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-2 py-2 text-xs text-white">
                    <option value="easy">easy</option>
                    <option value="normal">normal</option>
                    <option value="hard">hard</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Minutes</span>
                  <input type="number" min={3} max={60} value={newMinutes} onChange={(e) => setNewMinutes(Number(e.target.value) || 10)} className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-2 py-2 text-xs text-white" />
                </label>
                <Field label="Icon" value={newIcon} onChange={setNewIcon} placeholder="🎮" />
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Color</span>
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full h-[38px] rounded-xl bg-neutral-950 border border-neutral-700 cursor-pointer" />
                </label>
              </div>
              <button type="button" onClick={createGameType} className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-black cursor-pointer">
                Add Game Type to Platform Catalog
              </button>
            </div>
          )}

          {/* VERSIONS */}
          {tab === 'versions' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-100">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" /> Real-time version tracking (date · time · year)
                </div>
                <p className="mt-1 opacity-90">If a game change feels bad/old-school, roll back to a known-good version. Current time: {clock}</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-2">
                <input value={manualLabel} onChange={(e) => setManualLabel(e.target.value)} placeholder="Checkpoint label" className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white" />
                <input value={manualNote} onChange={(e) => setManualNote(e.target.value)} placeholder="Optional note" className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white" />
                <button type="button" onClick={saveCheckpoint} className="px-3 py-2 rounded-lg bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer">
                  Save Checkpoint Now
                </button>
              </div>
              <div className="space-y-2">
                {sortedVersions.map((v) => (
                  <div key={v.versionId} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white">{v.label}</div>
                      <div className="text-[11px] text-emerald-300 font-mono">{v.savedAtDisplay}</div>
                      <div className="text-[10px] text-neutral-500">ISO {v.savedAt}</div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {v.savedByRole} {v.savedByName} · {v.kind} · {v.config.title}
                      </div>
                      <div className="text-[11px] text-neutral-500">{v.note}</div>
                    </div>
                    <button type="button" onClick={() => setConfirmRollback(v)} className="px-3 py-2 rounded-lg bg-neutral-800 text-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" /> Roll back
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmRollback && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-neutral-950 p-4 space-y-3">
            <h4 className="font-black text-white text-sm">Confirm Rollback</h4>
            <p className="text-xs text-neutral-300">
              Restore <strong>{confirmRollback.label}</strong>
              <br />
              <span className="font-mono text-emerald-300">{confirmRollback.savedAtDisplay}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmRollback(null)} className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-200 cursor-pointer">Cancel</button>
              <button type="button" onClick={() => doRollback(confirmRollback)} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer">Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Tab({
  id,
  tab,
  setTab,
  icon,
  label,
}: {
  id: StudioTab;
  tab: StudioTab;
  setTab: (t: StudioTab) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        soundManager.playTabSwitch();
        setTab(id);
      }}
      className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-b-2 ${
        tab === id ? 'border-violet-400 text-violet-300' : 'border-transparent text-neutral-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white" />
    </label>
  );
}
