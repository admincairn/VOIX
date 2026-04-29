// ============================================================
// VOIX — Widget Embed API
// GET /api/widgets/[id]/embed → returns JavaScript embed script
// ============================================================

import { NextResponse } from 'next/server'
import { supabaseAdminUntyped } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Récupérer le widget
  const { data: widget, error } = await supabaseAdminUntyped
    .from('widgets')
    .select('*, profile:profiles(company_name, logo_url)')
    .eq('id', id)
    .single()

  if (error || !widget) {
    return new NextResponse(
      `console.error('[VOIX] Widget not found: ${id}')`,
      {
        status: 404,
        headers: { 'Content-Type': 'application/javascript' },
      }
    )
  }

  // Générer le script
  const script = generateEmbedScript(widget)

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300', // 5 min cache
    },
  })
}

function generateEmbedScript(widget: any): string {
  const config = widget.config || {}
  const profile = widget.profile || {}

  return `
// VOIX Widget Embed v1.0
// Widget: ${widget.name}
// Company: ${profile.company_name || 'Unknown'}

(function() {
  'use strict';

  const WIDGET_ID = '${widget.id}';
  const CONFIG = ${JSON.stringify(config)};
  const PROFILE = ${JSON.stringify({
    companyName: profile.company_name,
    logoUrl: profile.logo_url,
  })};

  // ── Helpers ─────────────────────────────────────────────

  function createElement(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(key => {
        if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(el.style, attrs[key]);
        } else {
          el.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
    }
    return el;
  }

  function fetchTestimonials() {
    return fetch('/api/widgets/' + WIDGET_ID + '/data')
      .then(r => r.json())
      .then(data => data.testimonials || [])
      .catch(() => []);
  }

  // ── Styles ──────────────────────────────────────────────

  function getStyles() {
    const accent = CONFIG.accentColor || '#6366f1';
    const bg = CONFIG.backgroundColor || '#ffffff';
    const text = CONFIG.textColor || '#0f172a';
    const radius = (CONFIG.borderRadius || 12) + 'px';
    const spacing = (CONFIG.spacing || 24) + 'px';

    return \\`
      :host {
        display: block;
        font-family: \\${CONFIG.fontFamily || 'system-ui, -apple-system, sans-serif'};
        color: \\${text};
        --voix-accent: \\${accent};
        --voix-bg: \\${bg};
        --voix-text: \\${text};
        --voix-radius: \\${radius};
        --voix-spacing: \\${spacing};
      }

      .voix-widget {
        background: \\${bg};
        border-radius: \\${radius};
        padding: \\${spacing};
      }

      .voix-header {
        margin-bottom: \\${spacing};
      }

      .voix-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      .voix-card {
        background: \\${CONFIG.cardStyle === 'flat' ? 'transparent' : CONFIG.cardStyle === 'elevated' ? 'rgba(0,0,0,0.03)' : 'transparent'};
        border: \\${CONFIG.cardStyle === 'bordered' ? '1px solid ' + accent + '20' : 'none'};
        border-radius: \\${radius};
        padding: \\${spacing};
        margin-bottom: \\${spacing};
        box-shadow: \\${CONFIG.cardStyle === 'elevated' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'};
      }

      .voix-card:last-child {
        margin-bottom: 0;
      }

      .voix-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .voix-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: \\${accent};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }

      .voix-author {
        flex: 1;
        min-width: 0;
      }

      .voix-name {
        font-weight: 600;
        font-size: 14px;
        margin: 0;
      }

      .voix-title-role {
        font-size: 12px;
        opacity: 0.6;
        margin: 0;
      }

      .voix-source {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.4;
        background: rgba(0,0,0,0.05);
        padding: 2px 8px;
        border-radius: 4px;
      }

      .voix-content {
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        opacity: 0.85;
      }

      .voix-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(0,0,0,0.06);
      }

      .voix-stars {
        display: flex;
        gap: 2px;
      }

      .voix-star {
        width: 16px;
        height: 16px;
      }

      .voix-star-filled {
        fill: \\${accent};
      }

      .voix-star-empty {
        fill: currentColor;
        opacity: 0.2;
      }

      .voix-date {
        font-size: 12px;
        opacity: 0.4;
      }

      .voix-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: \\${spacing};
      }

      .voix-masonry {
        columns: 2;
        column-gap: \\${spacing};
      }

      .voix-masonry .voix-card {
        break-inside: avoid;
        margin-bottom: \\${spacing};
      }

      .voix-wall {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .voix-wall .voix-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px \\${spacing};
        margin-bottom: 0;
      }

      .voix-wall .voix-card-header {
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .voix-wall .voix-avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .voix-wall .voix-content {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .voix-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(0,0,0,0.05);
        border-radius: 100px;
        padding: 8px 16px;
      }

      .voix-badge-stars {
        display: flex;
        gap: 2px;
      }

      .voix-badge-text {
        font-weight: 600;
        font-size: 14px;
      }

      .voix-badge-count {
        font-size: 12px;
        opacity: 0.5;
      }

      @keyframes voix-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .voix-animate-fade {
        animation: voix-fade-in 0.4s ease both;
      }

      @media (max-width: 640px) {
        .voix-grid {
          grid-template-columns: 1fr;
        }
        .voix-masonry {
          columns: 1;
        }
      }
    \\`;
  }

  // ── Renderers ───────────────────────────────────────────

  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        createElement('svg', {
          class: 'voix-star ' + (filled ? 'voix-star-filled' : 'voix-star-empty'),
          viewBox: '0 0 20 20',
          style: { width: '16px', height: '16px' }
        }, [
          createElement('path', {
            d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
          })
        ])
      );
    }
    return createElement('div', { class: 'voix-stars' }, stars);
  }

  function renderCard(t, index) {
    const children = [];

    // Header
    const headerChildren = [];
    if (CONFIG.showAvatar !== false) {
      headerChildren.push(
        createElement('div', { class: 'voix-avatar' }, [
          t.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        ])
      );
    }
    headerChildren.push(
      createElement('div', { class: 'voix-author' }, [
        createElement('p', { class: 'voix-name' }, [t.customer_name]),
        t.customer_title && createElement('p', { class: 'voix-title-role' }, [t.customer_title])
      ])
    );
    if (CONFIG.showSource !== false) {
      headerChildren.push(
        createElement('span', { class: 'voix-source' }, [t.source])
      );
    }
    children.push(createElement('div', { class: 'voix-card-header' }, headerChildren));

    // Content
    children.push(createElement('p', { class: 'voix-content' }, ['"' + t.content + '"']));

    // Footer
    const footerChildren = [];
    if (CONFIG.showRating !== false && t.rating) {
      footerChildren.push(renderStars(t.rating));
    }
    if (CONFIG.showDate !== false && t.created_at) {
      const date = new Date(t.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      footerChildren.push(createElement('span', { class: 'voix-date' }, [date]));
    }
    if (footerChildren.length > 0) {
      children.push(createElement('div', { class: 'voix-footer' }, footerChildren));
    }

    return createElement('div', {
      class: 'voix-card voix-animate-fade',
      style: { animationDelay: (index * 0.1) + 's' }
    }, children);
  }

  function renderBadge(testimonials) {
    const avgRating = testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length
      : 0;

    return createElement('div', { class: 'voix-badge' }, [
      createElement('div', { class: 'voix-badge-stars' }, [
        renderStars(Math.round(avgRating))
      ]),
      createElement('span', { class: 'voix-badge-text' }, [
        avgRating.toFixed(1) + '/5'
      ]),
      createElement('span', { class: 'voix-badge-count' }, [
        '(' + testimonials.length + ' avis)'
      ])
    ]);
  }

  function renderWidget(testimonials) {
    const container = createElement('div', { class: 'voix-widget' });

    // Header
    if (CONFIG.type !== 'badge') {
      container.appendChild(
        createElement('div', { class: 'voix-header' }, [
          createElement('h3', { class: 'voix-title' }, [
            'Ce que nos clients disent'
          ])
        ])
      );
    }

    // Content
    const maxItems = Math.min(CONFIG.maxItems || 6, testimonials.length);
    const items = testimonials.slice(0, maxItems);

    if (CONFIG.type === 'badge') {
      container.appendChild(renderBadge(testimonials));
    } else if (CONFIG.type === 'grid') {
      container.appendChild(
        createElement('div', { class: 'voix-grid' }, items.map((t, i) => renderCard(t, i)))
      );
    } else if (CONFIG.type === 'masonry') {
      container.appendChild(
        createElement('div', { class: 'voix-masonry' }, items.map((t, i) => renderCard(t, i)))
      );
    } else if (CONFIG.type === 'single') {
      if (items[0]) container.appendChild(renderCard(items[0], 0));
    } else if (CONFIG.type === 'wall') {
      container.appendChild(
        createElement('div', { class: 'voix-wall' }, items.map((t, i) => renderCard(t, i)))
      );
    } else {
      // carousel (default)
      items.forEach((t, i) => container.appendChild(renderCard(t, i)));
    }

    return container;
  }

  // ── Main ────────────────────────────────────────────────

  function init() {
    const container = document.getElementById('voix-widget-' + WIDGET_ID);
    if (!container) {
      console.error('[VOIX] Container not found: #voix-widget-' + WIDGET_ID);
      return;
    }

    // Create shadow DOM
    const shadow = container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = getStyles();
    shadow.appendChild(styleEl);

    // Fetch and render
    fetchTestimonials().then(testimonials => {
      const widget = renderWidget(testimonials);
      shadow.appendChild(widget);
    });
  }

  // Auto-init or wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`
}