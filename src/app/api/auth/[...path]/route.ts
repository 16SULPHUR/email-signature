import { neonAuth } from '@/lib/auth/server'

const disabled = () => Response.json({ error: 'Social login is not configured' }, { status: 503 })
const handlers = neonAuth?.handler()

export const GET = handlers?.GET ?? disabled
export const POST = handlers?.POST ?? disabled
export const PUT = handlers?.PUT ?? disabled
export const PATCH = handlers?.PATCH ?? disabled
export const DELETE = handlers?.DELETE ?? disabled
