import { Link } from '@tanstack/react-router'
import { useAppSelector } from '@/store/redux/hooks'

export default function Layout({ children }: { children?: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user)
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-slate-200">
          <Link to="/" className="hover:text-sky-300">
            Home
          </Link>
          <Link to="/posts" className="hover:text-sky-300">
            Posts
          </Link>
          <Link to="/users" className="hover:text-sky-300">
            Users
          </Link>
          <Link
            to="/admin"
            className="ml-auto h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-sky-900 border border-sky-300 text-xs"
          >
            {`${user?.firstName?.[0]}/${user?.lastName?.[0]}`}
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  )
}
