// import { Outlet, createRootRoute, redirect } from '@tanstack/react-router'
// import Layout from '@/components/Layout'
// import { store } from '@/store'

// export const Route = createRootRoute({
//   beforeLoad: () => {
//     const { auth } = store.getState()

//     console.log(auth)

//     // if (!auth.token) {
//     //   throw redirect({ to: '/signin' })
//     // }
//   },
//   component: () => (
//     <Layout>
//       <Outlet />
//     </Layout>
//   ),
// })
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
