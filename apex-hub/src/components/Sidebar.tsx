import Link from "next/link";
import { Home, Bookmark, Hash, Search, Settings } from "lucide-react";

export function Sidebar() {
    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Bookmark, label: "Saved", href: "/saved" },
        { icon: Hash, label: "Tags", href: "/tags" },
        { icon: Search, label: "Search", href: "/search" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-16 border-r border-zinc-800 bg-zinc-950 flex flex-col items-center py-6 z-50">
            <div className="mb-8">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600" />
            </div>

            <nav className="flex flex-col gap-6 w-full items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="p-3 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors group relative"
                    >
                        <item.icon strokeWidth={1.5} size={24} />
                        <span className="absolute left-14 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
