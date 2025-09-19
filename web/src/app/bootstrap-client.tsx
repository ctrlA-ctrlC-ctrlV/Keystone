'use client'
import { useEffect } from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default function BootstrapClient({ children }: { children: React.ReactNode }) {
    useEffect(() => {}, [])
    return <>{children}</>
}