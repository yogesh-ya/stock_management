import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Package, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/inventory", label: "Inventory", icon: Package },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/25">
            I
          </div>
          <span className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Invotrak
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={clsx(
              "nav-link group",
              location === item.href && "active"
            )}>
              <item.icon className={clsx(
                "w-5 h-5 transition-colors",
                location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
