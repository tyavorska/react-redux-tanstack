import { Outlet, createRootRoute } from '@tanstack/react-router'

import SignIn from './signin'
import Layout from '@/components/Layout'
import { useAppSelector } from '@/store/hooks'

export const Route = createRootRoute({
  component: () => {
    const user = useAppSelector((s) => s.auth.user)

    return user ? (
      <Layout>
        <Outlet />
      </Layout>
    ) : (
      <SignIn />
    )
  },
})
