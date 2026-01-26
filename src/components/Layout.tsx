import { Link } from '@tanstack/react-router';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-slate-900 text-slate-100'>
      <header className='border-b border-slate-800 p-4'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <nav className='space-x-4 text-slate-200 flex items-center gap-4'>
            <Link to='/' className='hover:text-sky-300'>
              Home
            </Link>
            <Link to='/posts' className='hover:text-sky-300'>
              Posts
            </Link>
            <Link to='/users' className='hover:text-sky-300'>
              Users
            </Link>
            <Link to='/admin' className='hover:text-sky-300 left-6'>
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className='max-w-4xl mx-auto p-6'>{children}</main>
    </div>
  );
}
