'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // MVP: fake submit – later wire to API route / email service
    setSubmitted(true)
  }

  return (
    <>
      <h1 className="h2 fw-bold mb-4">Get a quote</h1>

      {!submitted ? (
        <form className="row g-3" onSubmit={onSubmit}>
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required />
          </div>
          <div className="col-12">
            <label className="form-label">Message</label>
            <textarea className="form-control" rows={4} placeholder="Tell us the size, cladding, doors, etc." />
          </div>
          <div className="col-12">
            <button className="btn btn-primary">Submit</button>
          </div>
        </form>
      ) : (
        <div className="alert alert-success" role="alert">
          Thanks! We’ll get back to you shortly.
        </div>
      )}
    </>
  )
}