import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

    const cookie = req.cookies.get('admin')?.value;
    if (cookie === process.env.ADMIN_TOKEN) return NextResponse.next();

    const provided = req.nextUrl.searchParams.get('token');
    if (provided === process.env.ADMIN_TOKEN) {
        const res = NextResponse.redirect(new URL('/admin', req.url));
        res.cookies.set('admin', provided, { httpOnly: true, secure: true, path: '/', maxAge: 60*60*8 });
        return res;
    }

    return new NextResponse('Unauthorised', { status: 401 });
}