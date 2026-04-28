// ============================================================
// VOIX — Welcome Email API
// POST /api/email/welcome
// Triggered by Auth.js signIn event for new users
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = `Voix <onboarding@${process.env.RESEND_FROM_DOMAIN ?? 'voix.app'}>`

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const firstName = name?.split(' ')[0] ?? 'there'

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Voix — Start collecting testimonials',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Voix
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
                    Welcome, ${firstName}!
                  </h2>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Thanks for joining Voix. You're on a 14-day free trial of our Growth plan — no credit card required.
                  </p>
                  <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    With Voix, you can collect video and text testimonials from your customers, embed them on your website with a single script tag, and turn them into your most powerful sales tool.
                  </p>

                  <!-- CTA Button -->
                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #a855f7);">
                        <a href="${process.env.NEXTAUTH_URL ?? 'https://voix.app'}/dashboard" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                          Get started →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Features List -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                    <tr>
                      <td>
                        <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                          <li>🎥 Collect video testimonials in minutes</li>
                          <li>📊 Embed widgets on any website</li>
                          <li>📧 Send email campaigns to gather reviews</li>
                          <li>⭐ Import from Google & G2</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                    Questions? Reply to this email or visit our
                    <a href="${process.env.NEXTAUTH_URL ?? 'https://voix.app'}/docs" style="color: #7c3aed;">documentation</a>.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('[Welcome Email] Failed to send:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (err) {
    console.error('[Welcome Email] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}