import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { checkAuthStatus } from '@/features/auth/auth.selectores'

import Layout from '@/components/Layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // wait for the Redux store to try refreshing the session
    const isAuthed = await checkAuthStatus()

    if (!isAuthed) {
      throw redirect({
        to: '/signin',
        replace: true,
        search: { redirect: location.href },
      })
    }
  },
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})
