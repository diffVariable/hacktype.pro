import { APP_NAME, LOGO_TEXT, SITE_URL } from '../constants';
import type { ISessionResult, TModeId } from '../types';
import { calcTraceProbability, getClearanceRank } from './wpm';

export type TShareOutcome = 'shared' | 'copied' | 'copied-text' | 'downloaded' | 'cancelled' | 'failed';

export function buildShareText(result: ISessionResult, mode: TModeId): string {
  const trace = calcTraceProbability(result.wpm);
  const rank = getClearanceRank(result.breachScore);
  return [
    `${LOGO_TEXT} // ${mode}`,
    `breach score: ${result.breachScore} (${rank.name})`,
    `wpm: ${result.wpm}`,
    `accuracy: ${result.accuracy}%`,
    `lines cleared: ${result.linesCleared}`,
    `trace probability: ${trace}% - connection terminated cleanly`,
    SITE_URL,
  ].join('\n');
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

interface ITextSegment {
  text: string;
  color: string;
}

function drawSegmentsCentered(
  ctx: CanvasRenderingContext2D,
  segments: ITextSegment[],
  centerX: number,
  y: number,
): void {
  const total = segments.reduce((sum, s) => sum + ctx.measureText(s.text).width, 0);
  let x = centerX - total / 2;
  for (const segment of segments) {
    ctx.fillStyle = segment.color;
    ctx.fillText(segment.text, x, y);
    x += ctx.measureText(segment.text).width;
  }
}

async function renderResultImage(result: ISessionResult, mode: TModeId): Promise<Blob | null> {
  await document.fonts.ready;

  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const bg = cssVar('--bg');
  const surface = cssVar('--surface');
  const surface2 = cssVar('--surface2');
  const border = cssVar('--border');
  const dim = cssVar('--dim');
  const text = cssVar('--text');
  const accent = cssVar('--accent');
  const fontMono = cssVar('--font-mono') || 'monospace';
  const hasGlow = cssVar('--glow') !== 'none';
  const dots = [cssVar('--dot-1'), cssVar('--dot-2'), cssVar('--dot-3')];

  const glowOn = () => {
    if (!hasGlow) return;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 14;
  };
  const glowOff = () => {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const card = { x: 80, y: 70, w: 1040, h: 490, r: 24 };
  roundedRect(ctx, card.x, card.y, card.w, card.h, card.r);
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();

  // title bar, clipped to the card corners
  ctx.save();
  roundedRect(ctx, card.x, card.y, card.w, card.h, card.r);
  ctx.clip();
  ctx.fillStyle = surface2;
  ctx.fillRect(card.x, card.y, card.w, 64);
  ctx.strokeStyle = border;
  ctx.beginPath();
  ctx.moveTo(card.x, card.y + 64);
  ctx.lineTo(card.x + card.w, card.y + 64);
  ctx.stroke();
  ctx.restore();

  dots.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(card.x + 40 + i * 30, card.y + 32, 9, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.textBaseline = 'middle';
  ctx.font = `26px ${fontMono}`;
  const titleHead = 'operator@ghost - ~/';
  ctx.fillStyle = dim;
  const titleX = card.x + 130;
  ctx.fillText(titleHead, titleX, card.y + 33);
  ctx.fillStyle = accent;
  ctx.fillText(mode, titleX + ctx.measureText(titleHead).width, card.y + 33);

  const cx = width / 2;

  ctx.font = `26px ${fontMono}`;
  ctx.fillStyle = dim;
  ctx.textAlign = 'center';
  ctx.fillText('breach score', cx, 190);

  glowOn();
  ctx.font = `700 150px ${fontMono}`;
  ctx.fillStyle = accent;
  ctx.fillText(String(result.breachScore), cx, 295);
  glowOff();

  const rank = getClearanceRank(result.breachScore);
  ctx.textAlign = 'left';
  ctx.font = `30px ${fontMono}`;
  drawSegmentsCentered(
    ctx,
    [
      { text: 'clearance: ', color: dim },
      { text: rank.name.toUpperCase(), color: accent },
    ],
    cx,
    368,
  );

  ctx.textAlign = 'center';
  ctx.font = `22px ${fontMono}`;
  ctx.fillStyle = dim;
  ctx.fillText(rank.blurb, cx, 406);

  ctx.textAlign = 'left';
  ctx.font = `28px ${fontMono}`;
  drawSegmentsCentered(
    ctx,
    [
      { text: 'wpm ', color: dim },
      { text: String(result.wpm), color: text },
      { text: '   acc ', color: dim },
      { text: `${result.accuracy}%`, color: text },
      { text: '   lines ', color: dim },
      { text: String(result.linesCleared), color: text },
      { text: '   errors ', color: dim },
      { text: String(result.errors), color: text },
    ],
    cx,
    448,
  );

  ctx.textAlign = 'center';
  ctx.font = `24px ${fontMono}`;
  ctx.fillStyle = dim;
  const trace = calcTraceProbability(result.wpm);
  ctx.fillText(`trace probability: ${trace}% - connection terminated cleanly`, cx, 500);

  ctx.textAlign = 'left';
  ctx.font = `28px ${fontMono}`;
  glowOn();
  drawSegmentsCentered(
    ctx,
    [
      { text: LOGO_TEXT, color: accent },
      { text: `  ${SITE_URL.replace('https://', '')}`, color: dim },
    ],
    cx,
    600,
  );
  glowOff();

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function shareResult(result: ISessionResult, mode: TModeId): Promise<TShareOutcome> {
  const shareText = buildShareText(result, mode);
  let blob: Blob | null = null;
  try {
    blob = await renderResultImage(result, mode);
  } catch {
    blob = null;
  }

  if (blob) {
    const file = new File([blob], `${APP_NAME}-result.png`, { type: 'image/png' });

    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareText });
        return 'shared';
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return 'cancelled';
        }
        // share sheet rejected it, fall through to clipboard
      }
    }

    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return 'copied';
      }
    } catch {
      // no image clipboard, fall through to download
    }

    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${APP_NAME}-result.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // revoke next tick so the download has kicked off first
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      return 'downloaded';
    } catch {
      // last resort: plain text
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return 'copied-text';
  } catch {
    return 'failed';
  }
}
