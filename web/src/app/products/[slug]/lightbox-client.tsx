'use client'
import { useEffect } from "react"

export default function LightboxClient() {
    useEffect(()=>{
        // custom event type with relatedTarget
        type BootstrapModalEvent = Event & { relatedTarget: EventTarget | null}

        const modal = document.getElementById('lightboxModal') as HTMLDivElement | null
        if (!modal) return

            const handler: EventListener = (e) => {
                const { relatedTarget } = e as BootstrapModalEvent
                const trigger = relatedTarget as (HTMLElement | null)
                if (!trigger) return

                const imgEl = document.getElementById('lightboxImage') as HTMLImageElement | null
                const newSrc =
                    trigger.getAttribute('data-bs-image') ||
                    (trigger as HTMLImageElement).src

                if (imgEl && newSrc) imgEl.src = newSrc
            }

            modal.addEventListener('show.bs.modal', handler)
            return () => modal.removeEventListener('show.bs.modal', handler)
        }, []);

    return null;
}