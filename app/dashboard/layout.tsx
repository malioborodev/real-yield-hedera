'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Plus, 
  ShoppingCart, 
  Wallet, 
  FileCheck,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  Bell,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/overview',
    icon: BarChart3,
    description: 'Portfolio overview and analytics'
  },
  {
    name: 'Create',
    href: '/dashboard/create',
    icon: Plus,
    description: 'Create new invoice NFTs'
  },
  {
    name: 'Marketplace',
    href: '/dashboard/marketplace',
    icon: ShoppingCart,
    description: 'Browse and invest in invoices'
  },
  {
    name: 'Portfolio',
    href: '/dashboard/portfolio',
    icon: Wallet,
    description: 'Manage your investments'
  },
  {
    name: 'Settlement',
    href: '/dashboard/settlement',
    icon: FileCheck,
    description: 'Handle invoice settlements'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/images/avatar.png',
    walletAddress: '0x1234...5678'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/dashboard/overview" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-app-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RY</span>
              </div>
              <span className="font-bold text-lg">Real Yield</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-app-blue-100 text-app-blue-700 dark:bg-app-blue-900 dark:text-app-blue-200"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-app-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-app-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.walletAddress}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-app-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Wallet Status */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-app-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>

              {/* User Menu */}
              <Button variant="ghost" size="sm">
                <div className="w-6 h-6 bg-app-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-app-blue-600" />
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}