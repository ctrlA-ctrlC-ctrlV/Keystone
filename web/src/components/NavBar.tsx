'use client'
import Link from 'next/link'

export default function NavBar() {
    return(
        <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand fw-bold">SDeal Construction</Link>

                <button className='navbar-toggler' type='button'
                    data-bs-toggle="collaps" data-bs-target="#mainNav"
                    aria-controls="mainNav" aria-expanded="false" aria-label='Toggle navigation'>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className='collapse navbar-collapse' id='mainNav'>
                    <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
                        <li className='nav-item dropdown'>
                            <Link href="/products" className="nav-link dropdown-toggle" id="navbarProductsDropdown" role="button" data-bs-toggle="dropdown" aria-expand="false">
                                Products
                            </Link>
                            <ul className="dropdown-menu dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <li><Link href="/products/garden-room" className="dropdown-item">Garden Room</Link></li>
                                <li><Link href="/products/house-extension" className="dropdown-item">House Extension</Link></li>
                                <li><Link href="/products/house-build" className="dropdown-item">House Build</Link></li>
                            </ul>                                                        
                        </li>
                        <li className="nav-item"><Link href="/portfolio" className="nav-link">Portfolio</Link></li>
                        <li className="nav-item"><Link href="/faq" className="nav-link">FAQ</Link></li>
                        <li className="nav-item"><Link href="/contact" className="nav-link">Contact</Link></li>
                    </ul>
                    <div className="ms-lg-3">
                        <Link href="/contact" className="btn btn-primary">Get a Quote</Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}