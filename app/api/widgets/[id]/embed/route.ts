// ============================================================
// VOIX — Widget Embed Script
// GET /api/widgets/[id]/embed
// PUBLIC — no authentication, served as JS
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { EmbedData } from '@/types'

type Params = { params: { id: string } }

export const runtime = 'edge'

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = params

  // ── 1. Fetch widget + profile ─────────────────────────────
  const { data: widget, error: widgetError } = await supabaseAdmin
    .from('widgets')
    .select('*, profile:profiles(company_name, logo_url)')
    .eq('id', id)
    .single()

  if (widgetError || !widget) {
    return new NextResponse(`console.error('[Voix] Widget not found: ${id}')`, {
      status: 404,
      headers: { 'Content-Type': 'application/javascript' },
    })
  }

  // ── 2. Fetch published testimonials ───────────────────────
  const filters = widget.filters as {
    minRating?: number
    sources?: string[]
    tags?: string[]
    status?: string
  }

  let query = supabaseAdmin
    .from('testimonials')
    .select('id, customer_name, customer_title, customer_avatar_url, content, video_url, rating, source, featured')
    .eq('profile_id', widget.profile_id)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(widget.config?.maxItems ?? 20)

  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating)
  }
  if (filters?.sources?.length) {
    query = query.in('source', filters.sources)
  }

  const { data: testimonials } = await query

  // ── 3. Track view (fire-and-forget) ──────────────────────
  supabaseAdmin
    .from('widgets')
    .update({ view_count: widget.view_count + 1 })
    .eq('id', id)
    .then(() => {})

  // ── 4. Build embed payload ────────────────────────────────
  const embedData: EmbedData = {
    widget: { id: widget.id, type: widget.type, config: widget.config },
    testimonials: testimonials ?? [],
    profile: widget.profile as { company_name: string; logo_url: string | null },
  }

  // ── 5. Generate the JS embed script ──────────────────────
  const script = generateEmbedScript(id, embedData)

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

// ─────────────────────────────────────────────────────────
// Script Generator
// Produces a self-contained IIFE — Shadow DOM, no deps
// ─────────────────────────────────────────────────────────

function generateEmbedScript(widgetId: string, data: EmbedData): string {
  const { widget, testimonials, profile } = data
  const config = widget.config
  const ACCENT = config?.accentColor ?? '#7c3aed'
  const THEME  = config?.theme ?? 'light'
  const IS_DARK = THEME === 'dark'

  const BG      = IS_DARK ? '#1a1a2e'   : '#ffffff'
  const TEXT     = IS_DARK ? '#f1f5f9'   : '#0a0a0b'
  const MUTED    = IS_DARK ? '#94a3b8'   : '#6b7280'
  const BORDER   = IS_DARK ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
  const CARD_BG  = IS_DARK ? 'rgba(255,255,255,0.06)' : '#f9fafb'

  // Escape for JS string injection
  const safeData = JSON.stringify({ testimonials, profile, config: widget.config, type: widget.type })
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')

  return `
(function() {
  'use strict';

  const WIDGET_ID = '${widgetId}';
  const DATA = ${safeData};
  const { testimonials, profile, config, type } = DATA;

  // ── Find container ──────────────────────────────────────
  const placeholder = document.getElementById('voix-widget-' + WIDGET_ID)
    || document.querySelector('[data-voix-widget="' + WIDGET_ID + '"]');

  if (!placeholder) {
    console.warn('[Voix] Container not found. Add: <div id="voix-widget-${widgetId}"></div>');
    return;
  }

  // ── Shadow DOM for CSS isolation ────────────────────────
  const shadow = placeholder.attachShadow({ mode: 'open' });

  // ── Styles ──────────────────────────────────────────────
  const styles = \`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      font-size: 14px;
      color: ${TEXT};
    }

    .voix-wrap {
      background: ${BG};
      border-radius: 16px;
      padding: 24px;
      border: 1px solid ${BORDER};
    }

    .voix-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .voix-brand {
      font-size: 12px;
      color: ${MUTED};
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }

    .voix-brand-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${ACCENT};
    }

    /* CAROUSEL */
    .voix-carousel {
      display: flex;
      gap: 16px;
      overflow: hidden;
      position: relative;
    }

    .voix-track {
      display: flex;
      gap: 16px;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    }

    .voix-card {
      background: ${CARD_BG};
      border: 1px solid ${BORDER};
      border-radius: 12px;
      padding: 20px;
      flex: 0 0 calc(100% - 32px);
      max-width: 380px;
      min-width: 260px;
    }

    /* GRID */
    .voix-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
    }

    .voix-grid .voix-card { flex: none; max-width: none; }

    /* SINGLE */
    .voix-single .voix-card {
      flex: none; max-width: 100%; min-width: 0;
      background: linear-gradient(135deg, ${CARD_BG}, ${BG});
    }

    /* BADGE (fixed bottom-right) */
    .voix-badge-wrap {
      position: fixed;
      bottom: 24px; right: 24px;
      z-index: 9999;
    }

    .voix-badge {
      background: ${BG};
      border: 1px solid ${BORDER};
      border-radius: 100px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .voix-badge:hover { transform: translateY(-2px); }

    .voix-badge-stars { color: #f59e0b; font-size: 12px; letter-spacing: -1px; }
    .voix-badge-text  { font-size: 12px; font-weight: 500; color: ${TEXT}; }

    /* CARD INTERNALS */
    .voix-source {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 5px;
      display: inline-block;
      margin-bottom: 10px;
      background: rgba(124,58,237,0.1);
      color: ${ACCENT};
    }

    .voix-stars {
      color: #f59e0b;
      font-size: 13px;
      letter-spacing: -1px;
      margin-bottom: 10px;
    }

    .voix-quote {
      font-size: 14px;
      line-height: 1.65;
      color: ${TEXT};
      font-style: italic;
      margin-bottom: 16px;
    }

    .voix-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .voix-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: ${ACCENT}22;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: ${ACCENT};
      flex-shrink: 0;
      overflow: hidden;
    }

    .voix-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .voix-author-name  { font-size: 13px; font-weight: 600; color: ${TEXT}; }
    .voix-author-title { font-size: 11.5px; color: ${MUTED}; }

    /* NAV ARROWS */
    .voix-nav {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    }

    .voix-arrow {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 1px solid ${BORDER};
      background: ${BG};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 14px;
      color: ${TEXT};
      transition: background 0.15s, border-color 0.15s;
    }

    .voix-arrow:hover { background: ${ACCENT}18; border-color: ${ACCENT}44; }

    .voix-dots {
      display: flex;
      gap: 5px;
      align-items: center;
      margin-top: 12px;
      justify-content: center;
    }

    .voix-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${BORDER};
      transition: background 0.2s, width 0.2s;
      cursor: pointer;
    }

    .voix-dot.active {
      background: ${ACCENT};
      width: 18px;
      border-radius: 3px;
    }

    /* VIDEO */
    .voix-video-thumb {
      width: 100%;
      aspect-ratio: 16/9;
      border-radius: 8px;
      background: #000;
      margin-bottom: 12px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
    }

    .voix-play-btn {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
    }

    .voix-play-icon {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: ${ACCENT};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;
    }
  \`;

  // ── Helpers ─────────────────────────────────────────────

  function stars(rating) {
    return '★'.repeat(Math.round(rating || 5)) + '☆'.repeat(5 - Math.round(rating || 5));
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function sourceLabel(source) {
    const map = { google: 'Google', g2: 'G2', capterra: 'Capterra', trustpilot: 'Trustpilot', video: 'Video', manual: 'Manual' };
    return map[source] || source;
  }

  function renderCard(t) {
    return \`
      <div class="voix-card" data-id="\${t.id}">
        \${t.source ? \`<span class="voix-source">\${sourceLabel(t.source)}</span>\` : ''}
        \${config?.showRating !== false && t.rating ? \`<div class="voix-stars">\${stars(t.rating)}</div>\` : ''}
        \${t.video_url ? \`
          <div class="voix-video-thumb" onclick="window.open('\${t.video_url}','_blank')">
            <div class="voix-play-btn"><div class="voix-play-icon">▶</div></div>
          </div>
        \` : ''}
        <p class="voix-quote">"\${t.content}"</p>
        <div class="voix-author">
          \${config?.showAvatar !== false ? \`
            <div class="voix-avatar">
              \${t.customer_avatar_url
                ? \`<img src="\${t.customer_avatar_url}" alt="\${t.customer_name}" loading="lazy">\`
                : initials(t.customer_name)}
            </div>
          \` : ''}
          <div>
            <div class="voix-author-name">\${t.customer_name}</div>
            \${t.customer_title ? \`<div class="voix-author-title">\${t.customer_title}</div>\` : ''}
          </div>
        </div>
      </div>
    \`;
  }

  // ── Renderers ────────────────────────────────────────────

  function renderCarousel(container) {
    let current = 0;
    const cards = testimonials.map(renderCard).join('');
    container.innerHTML = \`
      <div class="voix-carousel">
        <div class="voix-track" id="voix-track">\${cards}</div>
      </div>
      <div class="voix-nav">
        <button class="voix-arrow" id="voix-prev">‹</button>
        <button class="voix-arrow" id="voix-next">›</button>
      </div>
      <div class="voix-dots" id="voix-dots">
        \${testimonials.map((_, i) => \`<div class="voix-dot \${i === 0 ? 'active' : ''}" data-i="\${i}"></div>\`).join('')}
      </div>
    \`;

    const track = container.querySelector('#voix-track');
    const dots  = container.querySelectorAll('.voix-dot');

    function go(n) {
      current = (n + testimonials.length) % testimonials.length;
      track.style.transform = \`translateX(calc(-\${current} * (100% + 16px)))\`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    container.querySelector('#voix-prev').addEventListener('click', () => go(current - 1));
    container.querySelector('#voix-next').addEventListener('click', () => go(current + 1));
    dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.i)));

    // Autoplay
    if (config?.autoplay !== false) {
      setInterval(() => go(current + 1), config?.autoplayInterval ?? 5000);
    }
  }

  function renderGrid(container) {
    container.innerHTML = \`<div class="voix-grid">\${testimonials.map(renderCard).join('')}</div>\`;
  }

  function renderSingle(container) {
    const t = testimonials[0];
    if (!t) return;
    container.innerHTML = \`<div class="voix-single">\${renderCard(t)}</div>\`;
  }

  function renderBadge(container) {
    const avg = testimonials.reduce((s, t) => s + (t.rating || 5), 0) / (testimonials.length || 1);
    container.innerHTML = \`
      <div class="voix-badge-wrap">
        <div class="voix-badge">
          <span class="voix-badge-stars">\${stars(Math.round(avg))}</span>
          <span class="voix-badge-text">\${avg.toFixed(1)} · \${testimonials.length} reviews</span>
        </div>
      </div>
    \`;
  }

  // ── Mount ────────────────────────────────────────────────

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  const wrap = document.createElement('div');
  wrap.className = 'voix-wrap';
  shadow.appendChild(wrap);

  const header = document.createElement('div');
  header.className = 'voix-header';
  header.innerHTML = \`
    <a class="voix-brand" href="https://voix.app" target="_blank" rel="noopener">
      <span class="voix-brand-dot"></span>
      Powered by Voix
    </a>
  \`;
  wrap.appendChild(header);

  const content = document.createElement('div');
  wrap.appendChild(content);

  switch (type) {
    case 'grid':     renderGrid(content);     break;
    case 'single':   renderSingle(content);   break;
    case 'badge':    renderBadge(shadow);     break;  // outside wrap
    case 'carousel':
    default:         renderCarousel(content); break;
  }

})();
`.trim()
}
