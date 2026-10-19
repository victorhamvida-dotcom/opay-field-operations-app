import React, { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';
import { CDLSubLevel } from '../types/cdlPolicy';
import {
  CharacterId,
  PLAYABLE_CHARACTERS,
  PlayableCharacter,
  RunStats,
  wealthToRichLevel,
  RICH_LABELS,
  drawHumanCharacter,
} from '../types/careerRun';

export type CareerGameState = 'start' | 'playing' | 'paused' | 'gameover' | 'victory' | 'fate';

export interface CareerRunCanvasProps {
  gameState: CareerGameState;
  characterId: CharacterId;
  soundEnabled: boolean;
  onStatsUpdate: (s: RunStats) => void;
  onGameOver: (s: RunStats) => void;
  onVictory: (s: RunStats) => void;
  onTriggerQuestion: (q: FieldQuestion) => void;
}

export interface FieldQuestion {
  id: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
}

type Lane = 0 | 1 | 2;

interface Runner {
  lane: Lane;
  targetLane: Lane;
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  anim: number;
  hurtTimer: number;
}

interface WorldItem {
  id: number;
  kind: 'coin' | 'bundle' | 'shield' | 'hazard' | 'gate' | 'star';
  lane: Lane;
  z: number; // distance ahead
  taken?: boolean;
  label?: string;
  correct?: boolean;
}

const TIER_ORDER: CDLSubLevel[] = [
  'Warning 1', 'Warning 2', 'Warning 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
];

const QUESTIONS: FieldQuestion[] = [
  {
    id: 'q1',
    prompt: 'High-footfall FMCG merchant, whitelisted. Best first move?',
    options: [
      { text: 'Physical visit + VFO doc pre-check', correct: true },
      { text: 'Send flyer only, no visit', correct: false },
      { text: 'Split turnover across fake wallets', correct: false },
    ],
  },
  {
    id: 'q2',
    prompt: 'Merchant just repaid today. What should you do?',
    options: [
      { text: 'Pitch instant refinance + ask for referrals', correct: true },
      { text: 'Wait 4 months for them to call', correct: false },
      { text: 'Tell them never to borrow again', correct: false },
    ],
  },
  {
    id: 'q3',
    prompt: 'Someone offers kickback for a dead kiosk loan. You…',
    options: [
      { text: 'Reject, log fraud, protect compliance', correct: true },
      { text: 'Accept and rush the app', correct: false },
      { text: 'Stack empty terminals for Gold tier', correct: false },
    ],
  },
  {
    id: 'q4',
    prompt: 'Interest objection on spare-parts stock. Best pitch?',
    options: [
      { text: 'Frame loan as 14-day inventory ROI > interest', correct: true },
      { text: 'Claim interest is zero / free grant', correct: false },
      { text: 'Walk away without clarifying', correct: false },
    ],
  },
  {
    id: 'q5',
    prompt: 'Utility bill still in old landlord name. Next step?',
    options: [
      { text: 'Escalate CDLM WhatsApp for doc substitutes before VFO', correct: true },
      { text: 'Forge a utility bill', correct: false },
      { text: 'Force a tiny ₦50k loan only', correct: false },
    ],
  },
  {
    id: 'q6',
    prompt: 'Potential POS metric requires which standard?',
    options: [
      { text: 'Bound >30 days and >₦300 monthly', correct: true },
      { text: 'Any terminal regardless of days', correct: false },
      { text: 'Bound 10 days only', correct: false },
    ],
  },
];

export const CareerRunCanvas: React.FC<CareerRunCanvasProps> = ({
  gameState,
  characterId,
  soundEnabled,
  onStatsUpdate,
  onGameOver,
  onVictory,
  onTriggerQuestion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hero: PlayableCharacter =
    PLAYABLE_CHARACTERS.find((c) => c.id === characterId) || PLAYABLE_CHARACTERS[0];

  const runnerRef = useRef<Runner>({
    lane: 1,
    targetLane: 1,
    x: 0,
    y: 0,
    vy: 0,
    onGround: true,
    anim: 0,
    hurtTimer: 0,
  });

  const worldRef = useRef({
    distance: 0,
    speed: 6.2,
    score: 0,
    wealth: hero.startCash,
    cashDisbursed: hero.startCash,
    combo: 0,
    maxCombo: 0,
    shields: 1,
    tierIndex: 3,
    tactics: 0,
    right: 0,
    wrong: 0,
    whiteHits: 0,
    fraud: 0,
    elapsed: 0,
    items: [] as WorldItem[],
    spawnTimer: 0,
    gateTimer: 0,
    qIndex: 0,
    shake: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    floaters: [] as { x: number; y: number; text: string; color: string; life: number }[],
    active: false,
    pausedGate: false,
  });

  const keysRef = useRef({ left: false, right: false, jump: false });

  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  const reset = useCallback(() => {
    const h = PLAYABLE_CHARACTERS.find((c) => c.id === characterId) || PLAYABLE_CHARACTERS[0];
    runnerRef.current = {
      lane: 1,
      targetLane: 1,
      x: 0,
      y: 0,
      vy: 0,
      onGround: true,
      anim: 0,
      hurtTimer: 0,
    };
    worldRef.current = {
      distance: 0,
      speed: 5.8 * h.speedBonus,
      score: 0,
      wealth: h.startCash,
      cashDisbursed: h.startCash,
      combo: 0,
      maxCombo: 0,
      shields: 1,
      tierIndex: 3,
      tactics: 0,
      right: 0,
      wrong: 0,
      whiteHits: 0,
      fraud: 0,
      elapsed: 0,
      items: [],
      spawnTimer: 0,
      gateTimer: 0,
      qIndex: 0,
      shake: 0,
      particles: [],
      floaters: [],
      active: true,
      pausedGate: false,
    };
  }, [characterId]);

  useEffect(() => {
    if (gameState === 'playing') reset();
    else worldRef.current.active = false;
  }, [gameState, reset]);

  // External answer resolution
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { correct: boolean };
      const w = worldRef.current;
      const h = PLAYABLE_CHARACTERS.find((c) => c.id === characterId) || PLAYABLE_CHARACTERS[0];
      w.pausedGate = false;
      if (detail.correct) {
        w.right++;
        w.combo++;
        w.maxCombo = Math.max(w.maxCombo, w.combo);
        w.tactics = Math.min(6, w.tactics + 1);
        const gain = Math.round(420 * h.luckBonus * (1 + w.combo * 0.08));
        w.score += gain;
        w.wealth += 180000;
        w.cashDisbursed += 350000;
        w.whiteHits++;
        if (w.tierIndex < TIER_ORDER.length - 1) w.tierIndex++;
        soundManager.playRightApproach();
        soundManager.playDisbursementCash();
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
        w.floaters.push({ x: 200, y: 280, text: `CORRECT +${gain} · ₦180k`, color: '#34D399', life: 1 });
        if (w.tactics >= 6) {
          w.active = false;
          soundManager.playVictory();
          onVictory(snapshot(w, characterId));
        }
      } else {
        w.wrong++;
        w.combo = 0;
        w.wealth = Math.max(0, w.wealth - 220000);
        w.score = Math.max(0, w.score - 180);
        w.fraud++;
        if (w.tierIndex > 0) w.tierIndex = Math.max(0, w.tierIndex - 1);
        soundManager.playWrongApproach();
        w.shake = 0.7;
        w.floaters.push({ x: 200, y: 280, text: 'WRONG · WEALTH DOWN', color: '#F87171', life: 1 });
        if (w.wealth <= 0 || (w.tierIndex === 0 && w.wrong >= 3)) {
          w.active = false;
          soundManager.playGameOver();
          onGameOver(snapshot(w, characterId));
        }
      }
    };
    window.addEventListener('career-answer', handler as EventListener);
    return () => window.removeEventListener('career-answer', handler as EventListener);
  }, [characterId, onGameOver, onVictory]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.jump = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.jump = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const laneX = (lane: Lane, w: number) => w * (0.22 + lane * 0.28);

    const spawn = (kind: WorldItem['kind'], lane?: Lane) => {
      const w = worldRef.current;
      w.items.push({
        id: Math.random(),
        kind,
        lane: lane ?? ((Math.floor(Math.random() * 3) as Lane)),
        z: 1400 + Math.random() * 400,
        label: kind === 'coin' ? '₦' : kind === 'bundle' ? 'CASH' : kind === 'shield' ? 'SHIELD' : kind === 'hazard' ? 'TRAP' : kind === 'star' ? 'STAR' : 'GATE',
      });
    };

    const burst = (x: number, y: number, color: string, n = 10) => {
      for (let i = 0; i < n; i++) {
        worldRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const { width: W, height: H } = canvas;
      const w = worldRef.current;
      const r = runnerRef.current;
      const heroLocal = PLAYABLE_CHARACTERS.find((c) => c.id === characterId) || PLAYABLE_CHARACTERS[0];

      // Camera shake
      let ox = 0;
      let oy = 0;
      if (w.shake > 0) {
        ox = (Math.random() - 0.5) * w.shake * 14;
        oy = (Math.random() - 0.5) * w.shake * 14;
        w.shake = Math.max(0, w.shake - dt * 3);
      }

      ctx.save();
      ctx.translate(ox, oy);

      // Sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#042f2e');
      g.addColorStop(0.45, '#021a14');
      g.addColorStop(1, '#020b07');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Parallax stars / city lights
      ctx.fillStyle = 'rgba(16,185,129,0.15)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 97 + w.distance * 0.02) % (W + 40)) - 20;
        const sy = 30 + (i * 37) % 120;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground plane vanishing
      const horizon = H * 0.38;
      const groundTop = horizon;
      const groundBot = H;

      // Road
      ctx.fillStyle = '#0b1f18';
      ctx.beginPath();
      ctx.moveTo(W * 0.15, groundBot);
      ctx.lineTo(W * 0.85, groundBot);
      ctx.lineTo(W * 0.58, groundTop);
      ctx.lineTo(W * 0.42, groundTop);
      ctx.closePath();
      ctx.fill();

      // Lane lines animated
      ctx.strokeStyle = 'rgba(52,211,153,0.35)';
      ctx.lineWidth = 2;
      for (let lane = 1; lane <= 2; lane++) {
        const t = lane / 3;
        const xTop = W * (0.42 + t * 0.16);
        const xBot = W * (0.15 + t * 0.7);
        ctx.beginPath();
        // dashed feel via segments moving with distance
        const segs = 12;
        for (let s = 0; s < segs; s++) {
          const a = (s + ((w.distance * 0.02) % 1)) / segs;
          const b = Math.min(1, a + 0.04);
          const x1 = xTop + (xBot - xTop) * a;
          const y1 = groundTop + (groundBot - groundTop) * a;
          const x2 = xTop + (xBot - xTop) * b;
          const y2 = groundTop + (groundBot - groundTop) * b;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();
      }

      // Side market stalls parallax
      const stallOffset = (w.distance * 0.4) % 120;
      for (let i = -1; i < 8; i++) {
        const p = (i * 120 - stallOffset) / 700;
        if (p < 0 || p > 1) continue;
        const scale = 0.3 + p * 0.9;
        const y = groundTop + (groundBot - groundTop) * p;
        // left
        ctx.fillStyle = `rgba(16,185,129,${0.08 + p * 0.15})`;
        ctx.fillRect(W * 0.02, y - 30 * scale, 40 * scale, 30 * scale);
        // right
        ctx.fillRect(W * 0.92 - 20 * scale, y - 28 * scale, 38 * scale, 28 * scale);
      }

      if (gameState === 'playing' && w.active && !w.pausedGate) {
        w.elapsed += dt;
        w.distance += w.speed * 60 * dt;
        w.speed = Math.min(12, (5.8 + w.distance / 2500) * heroLocal.speedBonus);

        // Input lanes
        if (keysRef.current.left) {
          keysRef.current.left = false;
          r.targetLane = Math.max(0, r.targetLane - 1) as Lane;
          soundManager.playUiTap();
        }
        if (keysRef.current.right) {
          keysRef.current.right = false;
          r.targetLane = Math.min(2, r.targetLane + 1) as Lane;
          soundManager.playUiTap();
        }
        if (keysRef.current.jump && r.onGround) {
          keysRef.current.jump = false;
          r.vy = -11;
          r.onGround = false;
          soundManager.playBoost();
        }

        // Smooth lane lerp
        r.lane = r.targetLane;
        const targetX = laneX(r.targetLane, W);
        r.x += (targetX - (r.x || targetX)) * Math.min(1, dt * 12);
        if (!r.x) r.x = targetX;

        // Jump physics
        if (!r.onGround) {
          r.vy += 28 * dt;
          r.y += r.vy;
          if (r.y >= 0) {
            r.y = 0;
            r.vy = 0;
            r.onGround = true;
          }
        }
        r.anim += dt * (8 + w.speed);

        if (r.hurtTimer > 0) r.hurtTimer -= dt;

        // Spawn world items
        w.spawnTimer += dt;
        if (w.spawnTimer > Math.max(0.35, 0.85 - w.distance / 8000)) {
          w.spawnTimer = 0;
          const roll = Math.random();
          if (roll < 0.45) spawn('coin');
          else if (roll < 0.6) spawn('bundle');
          else if (roll < 0.7) spawn('shield');
          else if (roll < 0.88) spawn('hazard');
          else spawn('star');
        }

        w.gateTimer += dt;
        if (w.gateTimer > 11 && w.qIndex < QUESTIONS.length) {
          w.gateTimer = 0;
          // Approach gate then freeze into question
          spawn('gate', 1);
        }

        // Move items toward camera
        const approach = w.speed * 110 * dt;
        for (let i = w.items.length - 1; i >= 0; i--) {
          const it = w.items[i];
          it.z -= approach;
          const p = 1 - Math.min(1, Math.max(0, it.z / 1400));
          const x = laneX(it.lane, W);
          const y = groundTop + (groundBot - groundTop) * (0.15 + p * 0.75);
          const scale = 0.25 + p * 1.1;

          // Draw item
          if (!it.taken) {
            ctx.save();
            ctx.translate(x, y - r.y * 0.15);
            ctx.scale(scale, scale);
            if (it.kind === 'coin' || it.kind === 'bundle' || it.kind === 'star') {
              ctx.fillStyle = it.kind === 'star' ? '#FBBF24' : '#10B981';
              ctx.beginPath();
              ctx.arc(0, 0, it.kind === 'bundle' ? 18 : 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#064E3B';
              ctx.font = 'bold 11px system-ui';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(it.kind === 'bundle' ? '₦₦' : it.kind === 'star' ? '★' : '₦', 0, 1);
            } else if (it.kind === 'shield') {
              ctx.fillStyle = '#22D3EE';
              ctx.beginPath();
              ctx.arc(0, 0, 14, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#083344';
              ctx.font = 'bold 12px system-ui';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🛡', 0, 1);
            } else if (it.kind === 'hazard') {
              ctx.fillStyle = '#EF4444';
              ctx.beginPath();
              ctx.moveTo(0, -16);
              ctx.lineTo(14, 12);
              ctx.lineTo(-14, 12);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 12px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText('!', 0, 4);
            } else if (it.kind === 'gate') {
              ctx.strokeStyle = '#FBBF24';
              ctx.lineWidth = 4;
              ctx.strokeRect(-28, -36, 56, 52);
              ctx.fillStyle = 'rgba(251,191,36,0.15)';
              ctx.fillRect(-28, -36, 56, 52);
              ctx.fillStyle = '#FBBF24';
              ctx.font = 'bold 10px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText('Q', 0, -8);
            }
            ctx.restore();
          }

          // Collision near runner
          if (!it.taken && it.z < 120 && it.z > 20 && it.lane === r.targetLane && r.hurtTimer <= 0) {
            // jump dodges hazard only
            if (it.kind === 'hazard' && !r.onGround) {
              // dodged
            } else {
              it.taken = true;
              if (it.kind === 'coin') {
                w.score += 40;
                w.wealth += 25000;
                w.combo++;
                soundManager.playCollect(1 + (w.combo % 8) * 0.05);
                burst(x, y, '#34D399');
                w.floaters.push({ x, y: y - 20, text: '+₦25k', color: '#6EE7B7', life: 0.8 });
              } else if (it.kind === 'bundle') {
                w.score += 120;
                w.wealth += 90000;
                w.cashDisbursed += 120000;
                w.whiteHits++;
                soundManager.playDisbursementCash();
                burst(x, y, '#10B981', 16);
                w.floaters.push({ x, y: y - 24, text: '+₦90k BUNDLE', color: '#34D399', life: 1 });
              } else if (it.kind === 'star') {
                w.score += 200;
                w.tactics = Math.min(6, w.tactics + 1);
                if (w.tierIndex < TIER_ORDER.length - 1) w.tierIndex++;
                soundManager.playTacticsLevelUp();
                confetti({ particleCount: 25, spread: 50, origin: { y: 0.75 } });
                w.floaters.push({ x, y: y - 24, text: 'TIER UP!', color: '#FBBF24', life: 1 });
              } else if (it.kind === 'shield') {
                w.shields = Math.min(3, w.shields + 1);
                soundManager.playShieldPickup();
                w.floaters.push({ x, y: y - 20, text: '+SHIELD', color: '#22D3EE', life: 0.9 });
              } else if (it.kind === 'hazard') {
                if (w.shields > 0) {
                  w.shields--;
                  soundManager.playShieldBreak();
                  w.floaters.push({ x, y: y - 20, text: 'SHIELD SAVE', color: '#22D3EE', life: 0.9 });
                } else {
                  w.wrong++;
                  w.combo = 0;
                  w.wealth = Math.max(0, w.wealth - 150000);
                  w.score = Math.max(0, w.score - 100);
                  w.fraud++;
                  r.hurtTimer = 0.8;
                  w.shake = 0.6;
                  soundManager.playHit();
                  w.floaters.push({ x, y: y - 20, text: 'HIT -₦150k', color: '#F87171', life: 1 });
                  if (w.wealth <= 0) {
                    w.active = false;
                    soundManager.playGameOver();
                    onGameOver(snapshot(w, characterId));
                  }
                }
              } else if (it.kind === 'gate') {
                // Trigger question overlay
                w.pausedGate = true;
                const q = QUESTIONS[w.qIndex % QUESTIONS.length];
                w.qIndex++;
                onTriggerQuestion(q);
              }
            }
          }

          if (it.z < -40 || it.taken) w.items.splice(i, 1);
        }

        // Push stats
        onStatsUpdate(snapshot(w, characterId));
      }

      // Draw runner character (human male/female)
      const rx = r.x || laneX(r.lane, W);
      const ry = H * 0.72 + r.y;
      const bob = Math.sin(r.anim * 2) * (r.onGround ? 3 : 0);
      const leg = Math.sin(r.anim * 2.2) * 10;
      ctx.save();
      ctx.translate(rx, ry);
      if (r.hurtTimer > 0 && Math.floor(r.hurtTimer * 20) % 2 === 0) {
        ctx.globalAlpha = 0.55;
      }
      drawHumanCharacter(ctx, heroLocal, {
        bob,
        legPhase: leg,
        scale: 1.35,
      });
      // wealth aura
      const rl = wealthToRichLevel(w.wealth);
      if (rl >= 3) {
        ctx.strokeStyle = 'rgba(251,191,36,0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -40 + bob, 40 + Math.sin(w.elapsed * 4) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Particles
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const p = w.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 1.8;
        if (p.life <= 0) {
          w.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Floaters
      for (let i = w.floaters.length - 1; i >= 0; i--) {
        const f = w.floaters[i];
        f.y -= 20 * dt;
        f.life -= dt;
        if (f.life <= 0) {
          w.floaters.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.color;
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      }

      // HUD ribbon on canvas
      ctx.fillStyle = 'rgba(2,12,8,0.72)';
      ctx.fillRect(8, 8, W - 16, 46);
      ctx.strokeStyle = 'rgba(16,185,129,0.35)';
      ctx.strokeRect(8, 8, W - 16, 46);
      ctx.fillStyle = '#ECFDF5';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${heroLocal.name} · ${heroLocal.gender === 'female' ? '♀' : '♂'}`, 16, 28);
      ctx.fillStyle = '#6EE7B7';
      ctx.fillText(`₦${Math.floor(w.wealth).toLocaleString()}`, 16, 44);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(RICH_LABELS[wealthToRichLevel(w.wealth)], W - 16, 28);
      ctx.fillStyle = '#A7F3D0';
      ctx.fillText(`${Math.floor(w.distance)}m · ${TIER_ORDER[w.tierIndex]}`, W - 16, 44);

      // Poor/rich meter
      const meterW = W - 32;
      const rich = Math.min(1, w.wealth / 5000000);
      ctx.fillStyle = '#111827';
      ctx.fillRect(16, H - 18, meterW, 8);
      const mg = ctx.createLinearGradient(16, 0, 16 + meterW, 0);
      mg.addColorStop(0, '#EF4444');
      mg.addColorStop(0.5, '#F59E0B');
      mg.addColorStop(1, '#10B981');
      ctx.fillStyle = mg;
      ctx.fillRect(16, H - 18, meterW * rich, 8);

      ctx.restore();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameState, characterId, onGameOver, onStatsUpdate, onTriggerQuestion, onVictory]);

  // Touch: tap left/right half to change lane, swipe up jump
  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    if (e.cancelable) e.preventDefault();
    const t = e.touches[0];
    touchStartY.current = t.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = t.clientX - rect.left;
    if (x < rect.width / 3) {
      runnerRef.current.targetLane = Math.max(0, runnerRef.current.targetLane - 1) as Lane;
    } else if (x > (rect.width * 2) / 3) {
      runnerRef.current.targetLane = Math.min(2, runnerRef.current.targetLane + 1) as Lane;
    } else if (runnerRef.current.onGround) {
      runnerRef.current.vy = -11;
      runnerRef.current.onGround = false;
      soundManager.playBoost();
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const t = e.changedTouches[0];
    if (touchStartY.current - t.clientY > 40 && runnerRef.current.onGround) {
      runnerRef.current.vy = -11;
      runnerRef.current.onGround = false;
      soundManager.playBoost();
    }
  };

  return (
    <div className="relative game-canvas-frame w-full mx-auto overflow-hidden rounded-xl sm:rounded-2xl border-2 border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.2)] bg-neutral-950">
      <canvas
        ref={canvasRef}
        width={450}
        height={700}
        className="w-full h-full block select-none touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
};

function snapshot(w: {
  score: number;
  wealth: number;
  cashDisbursed: number;
  tactics: number;
  combo: number;
  maxCombo: number;
  shields: number;
  tierIndex: number;
  whiteHits: number;
  fraud: number;
  elapsed: number;
  distance: number;
  right: number;
  wrong: number;
}, characterId: CharacterId): RunStats {
  return {
    score: Math.floor(w.score),
    wealth: Math.floor(w.wealth),
    cashDisbursed: Math.floor(w.cashDisbursed),
    tacticsProgress: w.tactics,
    combo: w.combo,
    maxCombo: w.maxCombo,
    streak: w.combo,
    shields: w.shields,
    cdlTier: TIER_ORDER[w.tierIndex],
    whitelistedHits: w.whiteHits,
    fraudBlocks: w.fraud,
    elapsedSeconds: w.elapsed,
    distanceM: Math.floor(w.distance),
    rightAnswers: w.right,
    wrongAnswers: w.wrong,
    characterId,
    richLevel: wealthToRichLevel(w.wealth),
  };
}

/** Helper for parent to resolve answers */
export function submitCareerAnswer(correct: boolean) {
  window.dispatchEvent(new CustomEvent('career-answer', { detail: { correct } }));
}
