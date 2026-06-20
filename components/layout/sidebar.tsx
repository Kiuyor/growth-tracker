"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ListTodo,
  Coins,
  ShoppingBag,
  Flame,
  Sun,
  Moon,
  Menu,
  X,
  Timer,
  Smile,
  BarChart3,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/tasks", label: "任务", icon: ListTodo },
  { href: "/pomodoro", label: "番茄钟", icon: Timer },
  { href: "/checkin", label: "打卡", icon: Flame },
  { href: "/mood", label: "心情", icon: Smile },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/reports/weekly", label: "报告", icon: FileText },
  { href: "/shop", label: "商店", icon: ShoppingBag },
  { href: "/points", label: "积分", icon: Coins },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold">
          成长追踪
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              切换浅色模式
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              切换深色模式
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
        <Link href="/" className="text-lg font-bold">
          成长追踪
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-b bg-card md:hidden">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  切换浅色模式
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  切换深色模式
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
