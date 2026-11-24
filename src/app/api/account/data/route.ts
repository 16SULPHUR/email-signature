import { CATEGORIES, type Category, deleteCategory, requireUser } from '@/lib/server/account'

export async function DELETE(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const category = new URL(req.url).searchParams.get('category') as Category
  if (!CATEGORIES.includes(category)) return Response.json({ error: 'Unknown category' }, { status: 400 })
  return Response.json({ deleted: await deleteCategory(user.id, category) })
}
