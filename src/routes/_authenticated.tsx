import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { checkAuthStatus } from '@/features/auth/auth.selectores'

import Layout from '@/components/Layout'
import { checkAuthStatusZustand } from '@/features/auth/zustand/auth.util'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const isAuthed = await checkAuthStatusZustand()

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
