import { accountSummary, requireUser } from '@/lib/server/account'

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error
  return Response.json({
    user: { id: user.id, email: user.email, name: user.name || '', createdAt: user.createdAt },
    summary: await accountSummary(user.id),
  })
}
