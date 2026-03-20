export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/quiz",
        "/history",
        "/results",
        "/dashboard",
        "/api/quiz/:path*",
        "/api/dashboard/:path*"
    ]
}
