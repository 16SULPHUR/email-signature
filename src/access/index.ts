import type { Access, PayloadRequest } from 'payload'

export const isAdmin = ({ req }: { req: PayloadRequest }) => req.user?.role === 'admin'

export const loggedIn: Access = ({ req }) => Boolean(req.user)

export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  return { id: { equals: req.user.id } }
}

export const adminOrOwner: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  return { owner: { equals: req.user.id } }
}
