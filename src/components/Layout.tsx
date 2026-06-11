import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookPlus, Library, Users, PlusCircle, BookOpen, Home, BookmarkPlus, ClipboardCheck, ArrowLeftRight, Settings2, User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationCenter from './NotificationCenter'

export default function Layout() {
  const location = useLocation()
  const isTracePage = location.pathname.startsWith('/trace/')
  const nickname = '书店管理员'

  if (isTracePage) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    )
  }

  const navItems = [
    { to: '/', label: '书店首页', icon: Home, external: true },
    { to: '/dashboard', label: '管理仪表盘', icon: LayoutDashboard },
    { to: '/books', label: '库存管理', icon: Library },
    { to: '/books/new', label: '图书入库', icon: BookPlus },
    { to: '/donations/review', label: '捐赠审核', icon: ClipboardCheck },
    { to: '/exchanges', label: '交换市场', icon: ArrowLeftRight },
    { to: '/exchanges/manage', label: '交换管理', icon: Settings2 },
    { to: '/reservations', label: '预约管理', icon: BookmarkPlus },
    { to: '/meetups', label: '读书会', icon: Users },
    { to: '/meetups/new', label: '发起活动', icon: PlusCircle },
    { to: '/feedbacks', label: '反馈管理', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-coffee-100 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 border-b border-coffee-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-coffee-900">墨香书坊</h1>
              <p className="text-xs text-coffee-500">溯源与读书会</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            if (item.external) {
              return (
                <a
                  key={item.to}
                  href={item.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-coffee-600 hover:bg-coffee-50 hover:text-coffee-800"
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </a>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-coffee-50 text-coffee-800 shadow-sm'
                      : 'text-coffee-600 hover:bg-coffee-50 hover:text-coffee-800'
                  )
                }
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-coffee-100">
          <div className="p-3 rounded-lg bg-coffee-50">
            <p className="text-xs font-medium text-coffee-700">{nickname}</p>
            <p className="text-xs text-coffee-500 mt-0.5">欢迎回来，今天也要加油！</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-coffee-100 p-4 hidden md:flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coffee-50">
            <User className="w-4 h-4 text-coffee-600" />
            <span className="text-sm text-coffee-700">{nickname}</span>
          </div>
          <NotificationCenter nickname={nickname} />
        </header>

        <header className="md:hidden bg-white border-b border-coffee-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-serif font-bold text-coffee-900">墨香书坊</h1>
            </div>
            <NotificationCenter nickname={nickname} />
          </div>
          <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {navItems.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.to}
                    href={item.to}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all text-coffee-600 hover:bg-coffee-50"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </a>
                )
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                      isActive
                        ? 'bg-coffee-100 text-coffee-800'
                        : 'text-coffee-600 hover:bg-coffee-50'
                    )
                  }
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="container max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
