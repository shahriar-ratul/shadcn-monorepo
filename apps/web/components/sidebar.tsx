"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, FileText, Settings, HelpCircle, ChevronRight, Mail } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Form",
    href: "/form",
    icon: FileText,
  },
  {
    title: "Send Email",
    href: "/send-email",
    icon: Mail,
  },
]

const secondaryItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-2 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      <Separator className="mx-3" />

      <div className="px-3 py-2">
        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-auto px-3 py-2">
        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-sm font-semibold mb-1">Need Help?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Check out our documentation and guides
          </p>
          <Button size="sm" className="w-full">
            View Docs
          </Button>
        </div>
      </div>
    </div>
  )
}
