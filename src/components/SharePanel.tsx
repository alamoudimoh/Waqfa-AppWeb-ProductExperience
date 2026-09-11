import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { publicUrl } from '../content'

const shareMessage = 'وقفة — مساحة يومية للذكر والورد. هذا التطبيق وقفٌ لله تعالى.'

function encoded(value: string) {
  return encodeURIComponent(value)
}

export function SharePanel() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const links = [
    { label: 'واتساب', href: `https://wa.me/?text=${encoded(shareMessage + ' ' + publicUrl)}` },
    { label: 'تيليجرام', href: `https://t.me/share/url?url=${encoded(publicUrl)}&text=${encoded(shareMessage)}` },
    { label: 'إكس', href: `https://twitter.com/intent/tweet?url=${encoded(publicUrl)}&text=${encoded(shareMessage)}` },
    { label: 'فيسبوك', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded(publicUrl)}` },
  ]

  const close = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => buttonRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [close, open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
    } catch {
      const field = document.createElement('textarea')
      field.value = publicUrl
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.append(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setStatus('تم نسخ رابط وقفة')
  }

  const share = async () => {
    const shareData = { title: 'وقفة', text: shareMessage, url: publicUrl }
    const coarsePointer = matchMedia('(pointer: coarse)').matches
    const canShare = typeof navigator.canShare !== 'function' || navigator.canShare(shareData)
    if (coarsePointer && canShare && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData)
        setStatus('شكرًا لمساهمتك في نشر الوقف')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    setOpen(current => !current)
  }

  return <div className="waqf-share">
    <button ref={buttonRef} className="button primary share-main" type="button" onClick={share} aria-haspopup="true" aria-expanded={open} aria-controls={panelId}>شارك وقفة<span aria-hidden="true">↗</span></button>
    <div ref={panelRef} id={panelId} className="share-panel" hidden={!open} role="group" aria-label="خيارات مشاركة وقفة">
      {links.map(link => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
      <button type="button" onClick={copyLink}>نسخ الرابط</button>
      <button className="share-close" type="button" onClick={close} aria-label="إغلاق خيارات المشاركة">إغلاق</button>
    </div>
    <p className="share-status" aria-live="polite">{status}</p>
  </div>
}
