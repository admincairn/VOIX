// ============================================================
// VOIX — OG Image Generator
// /api/og?title=...&sub=...
// Uses @vercel/og (Edge runtime — zero cold start)
// ============================================================

import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const BASE_URL = 'https://voix.app'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Turn customers into your best salespeople'
  const sub   = searchParams.get('sub')   ?? 'Collect, manage, and embed testimonials that convert.'

  return new ImageResponse(
    (
      <div
        style={{
          width:      '100%',
          height:     '100%',
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0b',
          padding:    '60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position:   'relative',
          overflow:   'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position:    'absolute',
            top:         '-200px',
            left:        '50%',
            transform:   'translateX(-50%)',
            width:       '800px',
            height:      '600px',
            background:  'radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, rgba(236,72,153,0.15) 40%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '12px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width:          '48px',
              height:         '48px',
              borderRadius:   '14px',
              background:     'linear-gradient(135deg, #7c3aed, #ec4899)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#fff',
              fontSize:       '20px',
              fontWeight:     '900',
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize:   '32px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)',
              backgroundClip: 'text',
              color:      'transparent',
              letterSpacing: '-1px',
            }}
          >
            Voix
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize:    '52px',
            fontWeight:  '900',
            color:       '#ffffff',
            textAlign:   'center',
            lineHeight:  1.1,
            letterSpacing: '-2px',
            maxWidth:    '900px',
            margin:      '0 0 20px 0',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize:  '22px',
            color:     'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth:  '600px',
            margin:    '0 0 48px 0',
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>

        {/* CTA pill */}
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            background:   'linear-gradient(135deg, #7c3aed, #ec4899)',
            borderRadius: '100px',
            padding:      '12px 28px',
          }}
        >
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
            voix.app
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
            · Free 14-day trial
          </span>
        </div>

        {/* Star ratings */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
            marginTop:  '28px',
          }}
        >
          <span style={{ color: '#f59e0b', fontSize: '20px', letterSpacing: '-2px' }}>★★★★★</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Loved by 2,400+ teams
          </span>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  )
}
