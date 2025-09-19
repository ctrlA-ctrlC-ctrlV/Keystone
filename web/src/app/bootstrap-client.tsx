'use client'
import { useEffect } from 'react'

export default function BootstrapClient({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
    }, [])
    
    return <>{children}</>
}