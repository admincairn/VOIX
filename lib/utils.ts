// ============================================================
// VOIX — Utility Functions
// ============================================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Plan, PlanId } from '@/types'

// ── Tailwind class merger ─────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formatters ────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString('en-US')
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDate(
  date: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
  return new Date(date).toLocaleDateString('en-US', opts)
}

export function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60)    return 'just now'
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  const days = Math.floor(secs / 86400)
  if (days === 1)   return 'Yesterday'
  if (days < 7)     return `${days} days ago`
  return formatDate(dateStr)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Plan guards ───────────────────────────────────────────

export function isFeatureAvailable(
  plan: Plan | null | undefined,
  feature: keyof Plan['features']
): boolean {
  if (!plan) return false
  return plan.features[feature] === true
}

export function isUnlimited(value: number): boolean {
  return value === -1
}

export function getPlanLimit(plan: Plan | null | undefined, key: 'max_testimonials' | 'max_videos_monthly' | 'max_widgets'): number | '∞' {
  if (!plan) return 0
  const v = plan[key]
  return v === -1 ? '∞' : v
}

// ── Plan display ──────────────────────────────────────────

export const PLAN_COLORS: Record<PlanId, { bg: string; text: string; border: string }> = {
  starter: { bg: '#f3f4f6', text: '#374151',  border: '#e5e7eb' },
  growth:  { bg: '#ede9fe', text: '#6d28d9',  border: '#c4b5fd' },
  scale:   { bg: '#fce7f3', text: '#be185d',  border: '#f9a8d4' },
}

// ── API helpers ───────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function apiError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ data: null, error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Token generation ──────────────────────────────────────

export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (const byte of array) {
    token += chars[byte % chars.length]
  }
  return token
}

// ── Stars ─────────────────────────────────────────────────

export function ratingToStars(rating: number | null): string {
  if (!rating) return '—'
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
