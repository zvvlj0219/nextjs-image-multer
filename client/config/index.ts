export const isDevelopment = process.env.NODE_ENV !== 'production'

export const baseUrl = !isDevelopment
    ? process.env.NEXT_PUBLIC_BASEURL_PRODUCTION ?? 'http://localhost:5000/api'
    : 'http://localhost:5000/api'
