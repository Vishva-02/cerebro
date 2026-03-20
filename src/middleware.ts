import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
    secret: process.env.NEXTAUTH_SECRET,
})

export const config = {
    matcher: [
        "/history",
        "/dashboard",
        "/api/quiz/:path*",
        "/api/dashboard/:path*"
    ]
}
