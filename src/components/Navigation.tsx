'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  Activity, 
  BarChart3,
  Calendar,
  Settings,
  User,
  LogOut
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  departmentId?: string
}

interface NavigationProps {
  user: User
}

const Navigation = ({ user }: NavigationProps) => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getNavigationItems = () => {
    switch (user.role) {
      case 'ADMIN':
      case 'MANAGER':
        return [
          { name: 'Dashboard', href: '/manager', current: pathname === '/manager', icon: Home },
          { name: 'Users', href: '/manager/users', current: pathname.startsWith('/manager/users'), icon: Users },
          { name: 'Departments', href: '/manager/departments', current: pathname.startsWith('/manager/departments'), icon: Building2 },
          { name: 'Projects', href: '/manager/projects', current: pathname.startsWith('/manager/projects'), icon: FolderOpen },
          { name: 'Tasks', href: '/manager/tasks', current: pathname.startsWith('/manager/tasks'), icon: CheckSquare },
          { name: 'Workload', href: '/manager/workload', current: pathname.startsWith('/manager/workload'), icon: Activity },
          { name: 'Analytics', href: '/manager/analytics', current: pathname.startsWith('/manager/analytics'), icon: BarChart3 },
          { name: 'Calendar', href: '/manager/calendar', current: pathname.startsWith('/manager/calendar'), icon: Calendar },
        ]
      case 'DEPARTMENT':
        return [
          { name: 'Dashboard', href: '/department', current: pathname === '/department', icon: Home },
          { name: 'Team', href: '/department/team', current: pathname.startsWith('/department/team'), icon: Users },
          { name: 'Analytics', href: '/department/analytics', current: pathname.startsWith('/department/analytics'), icon: BarChart3 },
          { name: 'Calendar', href: '/department/calendar', current: pathname.startsWith('/department/calendar'), icon: Calendar },
        ]
      case 'FIELD':
        return [
          { name: 'Dashboard', href: '/field', current: pathname === '/field', icon: Home },
          { name: 'Calendar', href: '/field/calendar', current: pathname.startsWith('/field/calendar'), icon: Calendar },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">TemSafy Pro</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {user.role}
              </span>
            </div>
            <Link
              href="/profile"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <User className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.role}</div>
                </div>
              </div>
              <Link
                href="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-3" />
                  Profile Settings
                </div>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  signOut({ callbackUrl: '/login' })
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
