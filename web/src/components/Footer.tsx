export default function Footer() {
    return(
        <footer className="border-top mt-5">
            <div className="container py4 d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
                <small className="text-muted">© {new Date().getFullYear()} SDeal Construction • Created by Zhaoxiang Qiu</small>
                <ul className="nav">
                    <li className="nav-item"><a className="nav-link px-2" href="/privacy">Privacy</a></li>
                    <li className="nav-item"><a className="nav-link px-2" href="/terms">Terms</a></li>
                </ul>
            </div>
        </footer>
    )
}