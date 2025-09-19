import Image from "next/image";

export default function Home() {
  return (
      <>
      <section className="py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold mb-3">Garden rooms & home extensions done right.</h1>
            <p className="lead text-secondary mb-4">
              Fast, energy-efficient builds with clear pricing and professional installation.
            </p>
            <div className="d-flex gap-3">
              <a className="btn btn-primary btn-lg" href="/contact">Get a Quote</a>
              <a className="btn btn-outline-secondary btn-lg" href="/products">See Products</a>
            </div>
          </div>
          <div className="col-lg-6 mt-4 mt-lg-0">
            <div className="card shadow-sm">
              <div className="ratio ratio-16x9 bg-light rounded-top"></div>
              <div className="card-body">
                <p className="mb-0">Hero image/video placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <h2 className="h3 fw-semibold mb-4">Why choose us</h2>
        <div className="row g-4">
          {["Fixed-price quotes", "Rapid install", "10-year warranty"].map((t,i)=>(
            <div className="col-md-4" key={i}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h3 className="h5">{t}</h3>
                  <p className="text-secondary mb-0">Short benefit description goes here.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
