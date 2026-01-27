import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/features/auth/auth.selectores'

import Layout from '@/components/Layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      console.log(isAuthenticated())

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
