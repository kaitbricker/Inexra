"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  InboxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAskInexraAI } from "@/components/AskInexraAIPanel";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Inbox", href: "/inbox", icon: InboxIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { open } = useAskInexraAI();

  return (
    <div
      className={`relative flex flex-col bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-48"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 z-10 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-700"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <span className={`text-xl font-bold ${isCollapsed ? "hidden" : "block"}`}>
          Inexra
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        {/* Ask InexraAI CTA Button */}
        <div className="mt-20 flex justify-center">
          <button
            className={`w-full max-w-[80%] rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-150 hover:from-blue-600 hover:to-purple-700 hover:scale-105 whitespace-nowrap ${isCollapsed ? "px-2" : ""}`}
            onClick={open}
          >
            <span className={`${isCollapsed ? "hidden" : "block"}`}>
              Ask InexraAI
            </span>
            <span className={`${isCollapsed ? "block" : "hidden"}`}>AI</span>
          </button>
        </div>
      </nav>
    </div>
  );
}