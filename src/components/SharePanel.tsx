import { useState } from 'react'
import { publicUrl } from '../content'

const shareMessage = 'وقفة — مساحة يومية للذكر والورد. هذا التطبيق وقفٌ لله تعالى.'

function encoded(value: string) {
  return encodeURIComponent(value)
}

export function SharePanel() {
  const [status, setStatus] = useState('')
  const links = [
    { label: 'واتساب', href: `https://wa.me/?text=${encoded(shareMessage + ' ' + publicUrl)}` },
    { label: 'تيليجرام', href: `https://t.me/share/url?url=${encoded(publicUrl)}&text=${encoded(shareMessage)}` },
    { label: 'فيسبوك', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded(publicUrl)}` },
    { label: 'إكس', href: `https://twitter.com/intent/tweet?url=${encoded(publicUrl)}&text=${encoded(shareMessage)}` },
  ]

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
    if ('share' in navigator) {
      try {
        await navigator.share({ title: 'وقفة', text: shareMessage, url: publicUrl })
        setStatus('شكرًا لمساهمتك في نشر الوقف')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  return <div className="waqf-share" aria-labelledby="share-waqf-title">
    <div className="waqf-share-heading">
      <div>
        <p className="share-kicker">ساهم في نشر الوقف</p>
        <h3 id="share-waqf-title">دلّ غيرك على وقفة.</h3>
      </div>
      <button className="button primary share-main" type="button" onClick={share}>شارك وقفة<span aria-hidden="true">↗</span></button>
    </div>
    <p className="share-copy">قد تكون مشاركتك سببًا في ذكرٍ يمتد أثره، أو في شخصٍ يجد لنفسه وقفةً في يومه.</p>
    <div className="share-platforms" aria-label="خيارات المشاركة">
      {links.map(link => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
      <button type="button" onClick={copyLink}>نسخ الرابط</button>
    </div>
    <p className="share-status" aria-live="polite">{status}</p>
  </div>
}
