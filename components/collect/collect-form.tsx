'use client'

// ============================================================
// VOIX — Public Collect Page
// /collect/[token]
// No authentication required
// ============================================================

import { useEffect, useState, useRef } from 'react'
import type { CollectSubmitInput } from '@/types'

interface CompanyInfo {
  customer_name:  string | null
  customer_email: string | null
  company: {
    company_name: string
    logo_url: string | null
    company_slug: string
  } | null
}

interface CollectFormProps {
  token: string
}

const STEPS = ['Your details', 'Your testimonial', 'Review & submit']

export function CollectForm({ token }: CollectFormProps) {
  const [info, setInfo]       = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [step, setStep]       = useState(0)
  const [done, setDone]       = useState(false)

  // Form state
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [title, setTitle]     = useState('')
  const [rating, setRating]   = useState(0)
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [consentDisplay, setConsentDisplay] = useState(false)
  const [consentSocial, setConsentSocial]   = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting]   = useState(false)
  const [recording, setRecording]     = useState(false)
  const [recSeconds, setRecSeconds]   = useState(0)

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLDivElement>(null)

  // Fetch invite info
  useEffect(() => {
    fetch(`/api/collect/${token}`)
      .then(r => {
        if (!r.ok) throw new Error('Invalid or used link')
        return r.json()
      })
      .then((data: CompanyInfo) => {
        setInfo(data)
        if (data.customer_name)  setName(data.customer_name)
        if (data.customer_email) setEmail(data.customer_email)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  // Recording timer
  useEffect(() => {
    let int: ReturnType<typeof setInterval>
    if (recording) {
      int = setInterval(() => setRecSeconds(s => s + 1), 1000)
    } else {
      setRecSeconds(0)
    }
    return () => clearInterval(int)
  }, [recording])

  async function handleSubmit() {
    if (!consentDisplay) return

    setSubmitting(true)
    try {
      const body: CollectSubmitInput = {
        customer_name:    name.trim(),
        customer_email:   email.trim() || undefined,
        customer_title:   title.trim() || undefined,
        content:          content.trim(),
        rating:           rating || 5,
        video_url:        videoUrl ?? undefined,
        consent_display:  consentDisplay,
        consent_social:   consentSocial,
      }

      const res = await fetch(`/api/collect/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Submission failed')
      }

      setDone(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function fmtTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  // ── Video Recording ──────────────────────────────────────

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true,
      })

      // Store stream for cleanup
      streamRef.current = stream

      // Create preview
      const videoEl = document.createElement('video')
      videoEl.srcObject = stream
      videoEl.autoplay = true
      videoEl.muted = true
      videoEl.style.cssText = 'width:100%;height:100%;object-fit:cover;transform:scaleX(-1);'

      const previewEl = document.getElementById('video-preview')
      if (previewEl) {
        previewEl.innerHTML = ''
        previewEl.appendChild(videoEl)
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        await uploadRecordedVideo()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setRecording(true)
      setVideoUrl(null)
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert('Could not access camera. Please allow camera access and try again.')
    }
  }

  async function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  async function uploadRecordedVideo() {
    if (chunksRef.current.length === 0) return

    setVideoUploading(true)

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const file = new File([blob], `testimonial-${Date.now()}.webm`, { type: 'video/webm' })

      const formData = new FormData()
      formData.append('video', file)

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setVideoUrl(data.videoUrl)

      // Clear preview
      const previewEl = document.getElementById('video-preview')
      if (previewEl) {
        previewEl.innerHTML = ''
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setVideoUploading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload MP4, WebM, MOV, or AVI.')
      return
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert('File too large. Maximum size is 100MB.')
      return
    }

    setVideoUploading(true)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setVideoUrl(data.videoUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setVideoUploading(false)
    }
  }

  // ── Loading state ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-bold mb-2">Link not valid</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // ── Success state ───────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-2xl mx-auto mb-5">
            ✓
          </div>
          <h2 className="text-xl font-bold mb-2">Thank you!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your testimonial has been submitted and is pending review by{' '}
            <strong>{info?.company?.company_name}</strong>. We appreciate your time!
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Powered by{' '}
            <a href="https://voix.app" className="text-violet-600 hover:underline">
              Voix
            </a>
          </p>
        </div>
      </div>
    )
  }

  const companyName = info?.company?.company_name ?? 'Us'

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-start py-10 px-4">
      {/* Brand */}
      <div className="text-center mb-8">
        <div
          className="text-xl font-black tracking-tight text-grad-full cursor-default mb-1"
          style={{ background: 'var(--grad-full)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Voix
        </div>
        <p className="text-xs text-gray-400">Requested by {companyName}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          {/* Step dots */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i <= step ? 'var(--grad-brand)' : '#e5e7eb',
                  width: i === step ? '24px' : '6px',
                }}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold tracking-tight leading-tight mb-1.5">
            {step === 0 && <><em className="not-italic" style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Share</em> your experience</>}
            {step === 1 && <>Record or <em className="not-italic" style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>write</em></>}
            {step === 2 && <>Review & <em className="not-italic" style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>submit</em></>}
          </h2>
          <p className="text-sm text-gray-500">
            {step === 0 && 'Takes under 2 minutes. Helps others make better decisions.'}
            {step === 1 && 'A 30–60 second video performs best — or write a few lines.'}
            {step === 2 && 'Review your details, agree to the terms, and submit.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">

          {/* STEP 0 — Details */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onMouseEnter={() => setHoveredStar(n)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(n)}
                      className="text-3xl transition-colors leading-none"
                      style={{ color: n <= (hoveredStar || rating) ? '#f59e0b' : '#e5e7eb' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Full name *</label>
                <input className="input" type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Job title & company</label>
                <input className="input" type="text" placeholder="Head of Growth, Acme Corp" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Work email</label>
                <input className="input" type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 1 — Testimonial */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Video zone */}
              <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${recording ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-gray-50'}`}>
                <div id="video-preview" className="w-full aspect-video bg-gray-900 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {recording ? (
                    <div className="text-white text-sm flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-mono text-red-400 font-bold">REC {fmtTime(recSeconds)}</span>
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <div className="text-green-400 text-sm font-medium">✓ Recording saved ({fmtTime(recSeconds)})</div>
                  ) : (
                    <div className="text-gray-500 text-sm text-center">
                      <div className="text-3xl mb-2 opacity-40">▶</div>
                      Click "Start recording" to begin
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={videoUploading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${recording ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}
                  >
                    {videoUploading ? '⏳ Uploading...' : recording ? '■ Stop recording' : '● Start recording'}
                  </button>
                  <label className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      onChange={handleFileUpload}
                      disabled={videoUploading || recording}
                      className="hidden"
                    />
                    {videoUploading ? '⏳ Uploading...' : '↑ Upload video'}
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200" />
                or
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label className="label">Written testimonial</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder="Tell us what you love, how it helped you, and what results you've seen…"
                  value={content}
                  onChange={e => setContent(e.target.value.slice(0, 500))}
                />
                <p className="text-right text-xs text-gray-400 mt-1">{content.length}/500</p>
              </div>
            </div>
          )}

          {/* STEP 2 — Consent */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Summary</p>
                <p className="text-sm font-semibold">{name || '—'}{title ? `, ${title}` : ''}</p>
                <div className="text-amber-400 text-sm my-1">{'★'.repeat(rating || 5)}</div>
                {content && (
                  <p className="text-sm text-gray-600 italic mt-1">
                    "{content.substring(0, 120)}{content.length > 120 ? '…' : ''}"
                  </p>
                )}
                {videoUrl && <p className="text-sm text-violet-600 mt-1">📹 Video testimonial included</p>}
              </div>

              {/* Consent checkboxes */}
              <div className="flex flex-col gap-3">
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentDisplay}
                    onChange={e => setConsentDisplay(e.target.checked)}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span className="text-sm text-gray-700 leading-snug">
                    I agree to have my testimonial displayed on {companyName}'s website and marketing materials.
                  </span>
                </label>
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSocial}
                    onChange={e => setConsentSocial(e.target.checked)}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span className="text-sm text-gray-700 leading-snug">
                    {companyName} may share this on social media.
                  </span>
                </label>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                By submitting, you agree to our{' '}
                <a href="/terms" className="underline">Terms</a>.
                {' '}Your data is processed under GDPR/CCPA. You can request removal at any time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-ghost text-sm py-2.5"
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < 2) setStep(s => s + 1)
              else handleSubmit()
            }}
            disabled={submitting || (step === 2 && !consentDisplay)}
            className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < 2
              ? 'Continue →'
              : submitting
              ? 'Submitting…'
              : 'Submit testimonial ✓'}
          </button>
          {step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Powered by{' '}
        <a href="https://voix.app" className="text-violet-500 hover:underline">
          Voix
        </a>
      </p>
    </div>
  )
}
