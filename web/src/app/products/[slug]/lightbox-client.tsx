'use client'
import { useEffect } from "react"

export default function LightboxClient() {
    useEffect(()=>{
        // custom event type with relatedTarget
        type BootstrapModalEvent = Event & { relatedTarget: EventTarget | null}

        const handler = (e: Event) => {
            const event = e as BootstrapModalEvent;
            const trigger = event.relatedTarget as HTMLElement | null;
            if (!trigger) return;
            const imgEl = document.getElementById('lightboxImage') as HTMLImageElement | null;
            const newSrc = trigger.getAttribute('data-bs-image') || (trigger as HTMLImageElement).src;
            if (imgEl && newSrc) imgEl.src = newSrc;
        };

        const modal = document.getElementById('lightboxModal');
        if(!modal) return;

        modal.addEventListener('show.bs.modal', handler as any);
        return () => modal.removeEventListener('show.bs.modal', handler as any);
    }, []);

    return null;
}