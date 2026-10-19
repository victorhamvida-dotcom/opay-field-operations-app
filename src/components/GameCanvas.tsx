import React, { useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/sound';
import { CDLSubLevel } from '../types/cdlPolicy';
import confetti from 'canvas-confetti';

export type GameState = 'start' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface GameStats {
  score: number;
  cashDisbursed: number;
  tacticsProgress: number; // 0 to 6
  combo: number;
  maxCombo: number;
  streak: number;
  shields: number;
  cdlTier: CDLSubLevel;
  whitelistedHits: number;
  fraudBlocks: number;
  elapsedSeconds: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

// Falling field items strictly aligned with OPay Merchant Loan & CDL Policy
interface FieldDropItem {
  id: number;
  type:
    | 'whitelisted_fmcg' // Right approach: FMCG high footfall from whitelisted sheet
    | 'vfo_verified'     // Right approach: Thorough VFO readiness preparation
    | 'refinance_boost'  // Right approach: Immediate refinance upon full repayment
    | 'cdlm_coaching'    // Right approach: WhatsApp coaching & personal disbursement
    | 'compliance_shield'// Right approach: Zero manipulation, strict integrity
    | 'tactic_dossier'   // Core 6 CDLM tactic milestones
    // WRONG APPROACHES (Hazardous)
    | 'unverified_kiosk' // Wrong approach: Incomplete documentation / dead kiosk
    | 'volume_manip'     // Wrong approach: Artificial manipulation (Downgrade!)
    | 'loan_default'     // Wrong approach: Overdue default merchant
    | 'kickback_scam';   // Wrong approach: Fraudulent kickback
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  value: number;
  cashAmount: number;
  title: string;
  subText: string;
  color: string;
  icon: string;
  pulse: number;
  isRightApproach: boolean;
}

const TIER_ORDER: CDLSubLevel[] = [
  'Warning 1', 'Warning 2', 'Warning 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3'
];

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (stats: GameStats) => void;
  onUnlockTactic: (tacticTitle: string, totalUnlocked: number) => void;
  onStatsUpdate: (stats: GameStats) => void;
  soundEnabled: boolean;
  onTriggerEncounter: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameOver,
  onUnlockTactic,
  onStatsUpdate,
  soundEnabled,
  onTriggerEncounter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player state: Represents the CDL in the field
  const playerRef = useRef({
    x: 200,
    y: 500,
    width: 68,
    height: 74,
    speed: 7.2,
    isDashing: false,
    dashCooldown: 0,
  });

  const stateRef = useRef<{
    score: number;
    cashDisbursed: number;
    tacticsProgress: number;
    combo: number;
    maxCombo: number;
    comboTimer: number;
    shields: number;
    cdlTierIndex: number; // 3 = Bronze 1
    screenShake: number;
    particles: Particle[];
    floatingTexts: FloatingText[];
    items: FieldDropItem[];
    spawnTimer: number;
    encounterTimer: number;
    whitelistedHits: number;
    fraudBlocks: number;
    difficultyMultiplier: number;
    gameStartTime: number;
    elapsedPlaySeconds: number;
    isGameActive: boolean;
  }>({
    score: 0,
    cashDisbursed: 200000,
    tacticsProgress: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    shields: 1,
    cdlTierIndex: 3, // Starts at Bronze 1
    screenShake: 0,
    particles: [],
    floatingTexts: [],
    items: [],
    spawnTimer: 0,
    encounterTimer: 0,
    whitelistedHits: 0,
    fraudBlocks: 0,
    difficultyMultiplier: 1,
    gameStartTime: performance.now(),
    elapsedPlaySeconds: 0,
    isGameActive: false,
  });

  const keysRef = useRef<{ left: boolean; right: boolean; dash: boolean }>({
    left: false,
    right: false,
    dash: false,
  });

  const touchStateRef = useRef<{ active: boolean; touchX: number }>({
    active: false,
    touchX: 200,
  });

  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 450;
    const height = canvas ? canvas.height : 700;

    playerRef.current = {
      x: width / 2 - 34,
      y: height - 92,
      width: 68,
      height: 74,
      speed: 7.2,
      isDashing: false,
      dashCooldown: 0,
    };

    stateRef.current = {
      score: 0,
      cashDisbursed: 250000,
      tacticsProgress: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      shields: 1,
      cdlTierIndex: 3, // Bronze 1
      screenShake: 0,
      particles: [],
      floatingTexts: [],
      items: [],
      spawnTimer: 0,
      encounterTimer: 0,
      whitelistedHits: 0,
      fraudBlocks: 0,
      difficultyMultiplier: 1,
      gameStartTime: performance.now(),
      elapsedPlaySeconds: 0,
      isGameActive: true,
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      resetGame();
    } else {
      stateRef.current.isGameActive = false;
    }
  }, [gameState, resetGame]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keysRef.current.left = true;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        keysRef.current.right = true;
      }
      if (e.code === 'Space' || e.key === ' ') {
        keysRef.current.dash = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keysRef.current.left = false;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        keysRef.current.right = false;
      }
      if (e.code === 'Space' || e.key === ' ') {
        keysRef.current.dash = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const spawnItem = (width: number) => {
      const state = stateRef.current;
      const rand = Math.random();

      let type: FieldDropItem['type'] = 'whitelisted_fmcg';
      let title = 'WHITELISTED FMCG';
      let subText = 'High Footfall Queue';
      let color = '#10B981';
      let icon = '🏬';
      let value = 150;
      let cashAmount = 500000;
      let isRightApproach = true;

      // 1. RIGHT APPROACH: 6 CDLM Tactics Dossier (when available)
      if (state.tacticsProgress < 6 && rand < 0.12) {
        type = 'tactic_dossier';
        const titles = [
          'CDLM Ikechukwu: Whitelist Storming',
          'CDLM Folorunsho: Instant Refinance',
          'CDLM Philip: WhatsApp Coaching',
          'CDLM Shafiu: VFO Readiness',
          'CDLM Orieke: Merchant Evangelism',
          'CDLM Ilenowa: Restocking ROI'
        ];
        title = `TACTIC #${state.tacticsProgress + 1}`;
        subText = titles[state.tacticsProgress] || 'CDLM Best Practice';
        color = '#F59E0B';
        icon = '📜';
        value = 500;
        cashAmount = 1000000;
        isRightApproach = true;
      }
      // 2. RIGHT APPROACH: Thorough VFO Readiness
      else if (rand < 0.28) {
        type = 'vfo_verified';
        title = 'VFO PRE-CHECK OK';
        subText = 'CAC & Lease Verified';
        color = '#06B6D4';
        icon = '📑';
        value = 250;
        cashAmount = 800000;
        isRightApproach = true;
      }
      // 3. RIGHT APPROACH: Refinancing Pipeline Upon Repayment
      else if (rand < 0.40) {
        type = 'refinance_boost';
        title = 'INSTANT REFINANCE';
        subText = 'Loan Settled Today';
        color = '#8B5CF6';
        icon = '🔄';
        value = 300;
        cashAmount = 1200000;
        isRightApproach = true;
      }
      // 4. RIGHT APPROACH: CDLM Coaching & Personal Disbursement Visit
      else if (rand < 0.48) {
        type = 'cdlm_coaching';
        title = 'CDLM DISBURSE VISIT';
        subText = 'High-Value Merchant Trust';
        color = '#EC4899';
        icon = '🤝';
        value = 280;
        cashAmount = 1500000;
        isRightApproach = true;
      }
      // 5. Compliance Shield
      else if (rand < 0.54 && state.shields < 3) {
        type = 'compliance_shield';
        title = 'AUDIT PASS';
        subText = 'Compliance Armor';
        color = '#38BDF8';
        icon = '🛡️';
        value = 100;
        cashAmount = 0;
        isRightApproach = true;
      }
      // 6. WRONG APPROACH: Non-operating wooden kiosk with unverified documents
      else if (rand < 0.72) {
        type = 'unverified_kiosk';
        title = 'DEAD KIOSK TRAP';
        subText = 'No Footfall / Missing CAC';
        color = '#EF4444';
        icon = '🏚️';
        value = -250;
        cashAmount = -200000;
        isRightApproach = false;
      }
      // 7. WRONG APPROACH: Artificial Volume Manipulation (Downgrade Risk!)
      else if (rand < 0.86) {
        type = 'volume_manip';
        title = 'VOLUME MANIPULATION';
        subText = 'Policy Violation Penalty';
        color = '#DC2626';
        icon = '🚫';
        value = -400;
        cashAmount = -400000;
        isRightApproach = false;
      }
      // 8. WRONG APPROACH: Private kickback scam
      else {
        type = 'kickback_scam';
        title = 'KICKBACK OFFER';
        subText = 'Disciplinary Exit Hazard';
        color = '#991B1B';
        icon = '⛔';
        value = -500;
        cashAmount = -500000;
        isRightApproach = false;
      }

      const itemW = 64;
      const itemH = 64;
      const spawnX = Math.random() * (width - itemW - 20) + 10;
      // Readable pace; slower if user saved "Prefer slower gameplay pace"
      const slower =
        typeof document !== 'undefined' && document.body?.closest('[data-slower-pace="1"]')
          ? 0.72
          : typeof document !== 'undefined' &&
            document.querySelector('[data-slower-pace="1"]')
          ? 0.72
          : 1;
      const baseSpeed = (0.9 + state.difficultyMultiplier * 0.45) * slower;

      state.items.push({
        id: Math.random() + Date.now(),
        type,
        x: spawnX,
        y: -itemH,
        vx: (Math.random() - 0.5) * 0.5,
        vy: baseSpeed + Math.random() * 0.4,
        width: itemW,
        height: itemH,
        value,
        cashAmount,
        title,
        subText,
        color,
        icon,
        pulse: 0,
        isRightApproach,
      });
    };

    const addParticles = (x: number, y: number, color: string, count = 12, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 7 + 2 : Math.random() * 4 + 1;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 3,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
        });
      }
    };

    const addFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
      stateRef.current.floatingTexts.push({
        id: Math.random(),
        x,
        y,
        text,
        color,
        alpha: 1,
        vy: -1.6,
        scale,
      });
    };

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const { width, height } = canvas;
      const state = stateRef.current;
      const player = playerRef.current;

      // Screen Shake
      let offsetX = 0;
      let offsetY = 0;
      if (state.screenShake > 0) {
        offsetX = (Math.random() - 0.5) * state.screenShake * 12;
        offsetY = (Math.random() - 0.5) * state.screenShake * 12;
        state.screenShake = Math.max(0, state.screenShake - dt * 3.5);
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Deep Field Ops Grid Background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#042217'); // Dark emerald
      grad.addColorStop(0.5, '#021810');
      grad.addColorStop(1, '#000b06');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Field Street Grid Lines (Market corridors)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.09)';
      ctx.lineWidth = 1.5;
      const laneWidth = width / 5;
      for (let x = laneWidth; x < width; x += laneWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Scanlines
      const scanOffset = (currentTime * 0.08) % 40;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      for (let y = scanOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Active Gameplay logic
      if (gameState === 'playing' && state.isGameActive) {
        // Track active play time (pauses excluded) for time-based ranking
        state.elapsedPlaySeconds += dt;
        // Gentle difficulty ramp: reaches 2x only after ~3 minutes of active play
        state.difficultyMultiplier = 1 + Math.min(1.0, state.elapsedPlaySeconds / 180);

        // Periodic triggers for interactive Merchant Scenarios (every 22 seconds)
        state.encounterTimer += dt;
        if (state.encounterTimer >= 40) {
          state.encounterTimer = 0;
          onTriggerEncounter();
        }

        // Combo decay
        if (state.comboTimer > 0) {
          state.comboTimer = Math.max(0, state.comboTimer - dt);
          if (state.comboTimer <= 0) {
            state.combo = 0;
          }
        }

        // Movement
        let targetX = player.x;
        const effectiveSpeed = player.isDashing ? player.speed * 2.2 : player.speed;

        if (touchStateRef.current.active) {
          const touchTarget = touchStateRef.current.touchX - player.width / 2;
          const diff = touchTarget - player.x;
          if (Math.abs(diff) > 4) {
            targetX = player.x + Math.sign(diff) * Math.min(Math.abs(diff) * 0.25, effectiveSpeed);
          }
        } else {
          if (keysRef.current.left) targetX -= effectiveSpeed;
          if (keysRef.current.right) targetX += effectiveSpeed;
        }

        // Dash mechanics
        if (keysRef.current.dash && player.dashCooldown <= 0) {
          player.isDashing = true;
          player.dashCooldown = 1.2;
          soundManager.playBoost();
          addParticles(player.x + player.width / 2, player.y + player.height, '#10B981', 16, true);
        }

        if (player.dashCooldown > 0) {
          player.dashCooldown -= dt;
          if (player.dashCooldown < 0.9) {
            player.isDashing = false;
          }
        }

        player.x = Math.max(8, Math.min(width - player.width - 8, targetX));
        player.y = height - 96;

        // Item Spawning
        state.spawnTimer += dt;
        // Slower, readable spawn cadence: one card every ~2.2s at start, never faster than 1.3s
        const spawnInterval = Math.max(1.3, 2.4 - state.difficultyMultiplier * 0.5);
        if (state.spawnTimer >= spawnInterval) {
          state.spawnTimer = 0;
          spawnItem(width);
        }

        // Update items & check collisions
        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];
          item.y += item.vy;
          item.x += item.vx;
          item.pulse = (item.pulse + dt * 4) % (Math.PI * 2);

          if (item.x <= 5 || item.x + item.width >= width - 5) {
            item.vx *= -1;
          }

          // Hitbox
          const playerPadding = 8;
          const hit =
            item.x < player.x + player.width - playerPadding &&
            item.x + item.width > player.x + playerPadding &&
            item.y < player.y + player.height - playerPadding &&
            item.y + item.height > player.y + playerPadding;

          if (hit) {
            // CRITICAL RULE: ONLY SCORE POINTS WHEN GETTING THE RIGHT LOAN DISBURSEMENT APPROACH
            if (item.isRightApproach) {
              // POSITIVE RIGHT APPROACH
              state.combo++;
              if (state.combo > state.maxCombo) state.maxCombo = state.combo;
              state.comboTimer = 3.6;

              const comboMultiplier = 1 + Math.min(state.combo * 0.1, 2.5);
              const earnedScore = Math.round(item.value * comboMultiplier);
              state.score += earnedScore; // ONLY AWARD POINTS FOR RIGHT APPROACH
              state.cashDisbursed += item.cashAmount;
              state.whitelistedHits++;

              if (item.type === 'compliance_shield') {
                state.shields = Math.min(3, state.shields + 1);
                soundManager.playShieldPickup();
                addFloatingText(item.x, item.y - 12, '+1 COMPLIANCE SHIELD', '#38BDF8', 1.2);
              } else if (item.type === 'tactic_dossier') {
                state.tacticsProgress++;
                soundManager.playTacticsLevelUp();
                soundManager.playTierUp();
                state.screenShake = 0.7;

                // CDL Tier advancement upon tactic milestones
                if (state.cdlTierIndex < TIER_ORDER.length - 1) {
                  state.cdlTierIndex = Math.min(TIER_ORDER.length - 1, state.cdlTierIndex + 1);
                }

                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.8 },
                  colors: ['#10B981', '#34D399', '#FBBF24', '#06B6D4'],
                });

                addFloatingText(width / 2 - 80, player.y - 45, `TACTIC MASTERED! ${TIER_ORDER[state.cdlTierIndex]}`, '#FBBF24', 1.3);
                onUnlockTactic(item.subText, state.tacticsProgress);

                if (state.tacticsProgress >= 6) {
                  state.isGameActive = false;
                  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
                  onGameOver({
                    score: state.score,
                    cashDisbursed: state.cashDisbursed,
                    tacticsProgress: state.tacticsProgress,
                    combo: state.combo,
                    maxCombo: state.maxCombo,
                    streak: state.combo,
                    shields: state.shields,
                    cdlTier: TIER_ORDER[state.cdlTierIndex],
                    whitelistedHits: state.whitelistedHits,
                    fraudBlocks: state.fraudBlocks,
                    elapsedSeconds: state.elapsedPlaySeconds,
                  });
                }
              } else {
                soundManager.playRightApproach();
                soundManager.playDisbursementCash();
                if (state.combo > 1) soundManager.playCombo(state.combo);
                addFloatingText(item.x, item.y - 12, `+₦${(item.cashAmount / 1000).toLocaleString()}k [${item.title}]`, '#34D399', 1.1);
                addParticles(item.x + item.width / 2, item.y + item.height / 2, '#10B981', 16, true);
              }
            } else {
              // WRONG APPROACH / HAZARD: NO POSITIVE POINTS EVER!
              if (state.shields > 0) {
                state.shields--;
                state.screenShake = 0.5;
                state.fraudBlocks++;
                soundManager.playShieldBreak();
                addParticles(player.x + player.width / 2, player.y + player.height / 2, '#38BDF8', 25, true);
                addFloatingText(player.x + 5, player.y - 20, 'SHIELD BLOCKED WRONG APPROACH!', '#38BDF8', 1.2);
              } else {
                // Wrong approach penalty: DEDUCTS score, resets combo, and causes tier downgrade risk
                state.screenShake = 0.8;
                soundManager.playWrongApproach();
                soundManager.playHit();
                state.combo = 0;
                state.score = Math.max(0, state.score + item.value); // item.value is negative
                state.cashDisbursed = Math.max(0, state.cashDisbursed + item.cashAmount);

                // Tier Downgrade when hitting serious policy violations
                if (item.type === 'volume_manip' || item.type === 'kickback_scam') {
                  if (state.cdlTierIndex > 0) {
                    state.cdlTierIndex--;
                    soundManager.playTierDown();
                    addFloatingText(width / 2 - 80, player.y - 60, `POLICY VIOLATION! DOWNGRADED TO ${TIER_ORDER[state.cdlTierIndex]}`, '#EF4444', 1.3);
                  }
                }

                addParticles(item.x + item.width / 2, item.y + item.height / 2, '#EF4444', 20, true);
                addFloatingText(item.x, item.y - 10, `WRONG APPROACH! 0 PTS (${item.title})`, '#EF4444', 1.2);

                // Game Over if entering Warning 1 with 0 cash balance
                if (state.cdlTierIndex === 0 && state.cashDisbursed <= 0) {
                  state.isGameActive = false;
                  soundManager.playGameOver();
                  onGameOver({
                    score: state.score,
                    cashDisbursed: state.cashDisbursed,
                    tacticsProgress: state.tacticsProgress,
                    combo: state.combo,
                    maxCombo: state.maxCombo,
                    streak: 0,
                    shields: state.shields,
                    cdlTier: TIER_ORDER[state.cdlTierIndex],
                    whitelistedHits: state.whitelistedHits,
                    fraudBlocks: state.fraudBlocks,
                    elapsedSeconds: state.elapsedPlaySeconds,
                  });
                }
              }
            }

            state.items.splice(i, 1);
            continue;
          }

          if (item.y > height + 40) {
            state.items.splice(i, 1);
          }
        }

        // Notify parent HUD
        onStatsUpdate({
          score: state.score,
          cashDisbursed: state.cashDisbursed,
          tacticsProgress: state.tacticsProgress,
          combo: state.combo,
          maxCombo: state.maxCombo,
          streak: state.combo,
          shields: state.shields,
          cdlTier: TIER_ORDER[state.cdlTierIndex],
          whitelistedHits: state.whitelistedHits,
          fraudBlocks: state.fraudBlocks,
          elapsedSeconds: state.elapsedPlaySeconds,
        });
      }

      // Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw Items
      state.items.forEach((item) => {
        const scale = 1 + Math.sin(item.pulse) * 0.08;
        ctx.save();
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        ctx.scale(scale, scale);

        if (item.isRightApproach) {
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = '#111827';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.5;

        const rw = item.width;
        const rh = item.height;
        ctx.beginPath();
        ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, -4);

        ctx.shadowBlur = 0;

        // Corner badge: ✓ for right approach, ✗ for wrong approach (instant read)
        ctx.beginPath();
        ctx.arc(rw / 2 - 4, -rh / 2 + 4, 9, 0, Math.PI * 2);
        ctx.fillStyle = item.isRightApproach ? '#10B981' : '#EF4444';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(item.isRightApproach ? '✓' : '✗', rw / 2 - 4, -rh / 2 + 4.5);

        // Readable label pill below card (title + sub text)
        ctx.font = 'bold 11px system-ui, sans-serif';
        const titleWidth = ctx.measureText(item.title).width;
        ctx.font = '9.5px system-ui, sans-serif';
        const subWidth = ctx.measureText(item.subText).width;
        const pillW = Math.max(titleWidth, subWidth) + 16;
        const pillH = 30;
        const pillY = rh / 2 + 4;

        ctx.fillStyle = 'rgba(2, 12, 8, 0.92)';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 7);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = item.color;
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(item.title, 0, pillY + 10);

        ctx.fillStyle = '#E5E7EB';
        ctx.font = '9.5px system-ui, sans-serif';
        ctx.fillText(item.subText, 0, pillY + 22);

        ctx.restore();
      });

      // Draw Player: OPay Field CDL Lead Vehicle / Vault
      ctx.save();
      const pX = player.x;
      const pY = player.y;
      const pW = player.width;
      const pH = player.height;

      // Shield Aura
      if (state.shields > 0) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(pX + pW / 2, pY + pH / 2, pW * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // CDL Field Cruiser Body
      const cdlGrad = ctx.createLinearGradient(pX, pY, pX, pY + pH);
      cdlGrad.addColorStop(0, '#10B981');
      cdlGrad.addColorStop(1, '#047857');
      ctx.fillStyle = cdlGrad;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = player.isDashing ? 20 : 10;
      ctx.beginPath();
      ctx.roundRect(pX, pY, pW, pH, 14);
      ctx.fill();

      // Border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#34D399';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // CDL Badge display
      ctx.fillStyle = '#064E3B';
      ctx.beginPath();
      ctx.roundRect(pX + 8, pY + 8, pW - 16, pH - 24, 8);
      ctx.fill();

      // "CDL" text
      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CDL LEAD', pX + pW / 2, pY + pH / 2 - 2);

      // Current Tier indicator on vehicle
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 8.5px system-ui, sans-serif';
      ctx.fillText(TIER_ORDER[state.cdlTierIndex], pX + pW / 2, pY + pH / 2 + 10);

      // Thrusters
      const flameHeight = Math.random() * 8 + 4 + (player.isDashing ? 12 : 0);
      const flameGrad = ctx.createLinearGradient(0, pY + pH, 0, pY + pH + flameHeight);
      flameGrad.addColorStop(0, '#34D399');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(pX + 18, pY + pH);
      ctx.lineTo(pX + pW / 2, pY + pH + flameHeight);
      ctx.lineTo(pX + pW - 18, pY + pH);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Draw Floating Texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= dt * 1.2;
        if (ft.alpha <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `bold ${Math.round(13 * ft.scale)}px system-ui, sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, onGameOver, onUnlockTactic, onStatsUpdate, onTriggerEncounter]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    // Prevent page scroll / bounce while steering on iOS/Android
    if (e.cancelable) e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch || rect.width <= 0) return;
    const scaleX = e.currentTarget.width / rect.width;
    touchStateRef.current = {
      active: true,
      touchX: (touch.clientX - rect.left) * scaleX,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    if (e.cancelable) e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch || rect.width <= 0) return;
    const scaleX = e.currentTarget.width / rect.width;
    touchStateRef.current.touchX = (touch.clientX - rect.left) * scaleX;
  };

  const handleTouchEnd = (e?: React.TouchEvent<HTMLCanvasElement>) => {
    if (e && e.cancelable) e.preventDefault();
    touchStateRef.current.active = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    playerRef.current.x = Math.max(8, Math.min(e.currentTarget.width - playerRef.current.width - 8, mouseX - playerRef.current.width / 2));
  };

  return (
    <div className="relative game-canvas-frame w-full mx-auto overflow-hidden rounded-xl sm:rounded-2xl border-2 border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.2)] bg-neutral-950">
      <canvas
        ref={canvasRef}
        width={450}
        height={700}
        className="w-full h-full block cursor-ew-resize select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};
