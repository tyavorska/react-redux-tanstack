import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getUser } from '../../api/api'

export const Route = createFileRoute('/users/$userId')({
  ssr: false,
  // loader reads single user by id param (router will provide params)
  loader: async ({ params }: { params: { userId: string } }) => {
    const id = Number(params.userId)
    if (Number.isNaN(id)) return { user: null }
    const res = await getUser(id)
    return { user: res }
  },
  component: UserAside,
})

export default function UserAside() {
  const { user } = useLoaderData({ from: Route.id })

  if (!user) {
    return (
      <div className="bg-slate-800 rounded-md p-4 text-slate-400">
        User not found
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-md p-4">
      <div className="flex items-start gap-4">
        <img
          src={user.image ?? ''}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-20 h-20 rounded object-cover bg-slate-700"
        />
        <div className="flex-1">
          <div className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-slate-400">{user.username}</div>
          <div className="text-sm text-slate-300 mt-2">{user.email}</div>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <div>
          <div className="text-slate-400 text-xs">Address</div>
          <div>
            {user.address?.address ?? ''}, {user.address?.city ?? ''}{' '}
            {user.address?.state ?? ''}
          </div>
          <div className="text-slate-400 text-xs mt-1">
            Postal: {user.address?.postalCode ?? '—'}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs">Company</div>
          <div className="font-semibold">{user.company?.name ?? '—'}</div>
          <div className="text-slate-400 text-xs">
            {user.company?.department ?? ''}
          </div>
          <div className="text-slate-300 text-sm mt-1">
            {user.company?.title ?? ''}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs">University</div>
          <div>{user.university ?? '—'}</div>
        </div>

        <div>
          <div className="text-slate-400 text-xs">Phone</div>
          <div>{user.phone ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}
