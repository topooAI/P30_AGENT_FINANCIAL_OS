"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getFullVersionDisplay } from "@/core/version";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTopooAuth } from "./auth-provider";
import { DocsBrand } from "@/fumadocs-system/components/docs-brand";
import { Button } from "@/fumadocs-system/components/ui/button";
import { cn } from "@/fumadocs-system/lib/utils";
import Image from "next/image";
import { EndpointsTab } from "./settings/endpoints-tab";

type NavItem = {
  href: string;
  label: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const topNav: NavItem[] = [
  { href: "/",          label: "Dashboard" },
  { href: "/logic-arb", label: "Strategies" },
  { href: "/decision",  label: "Decision Chain" },
  { href: "/intelligence", label: "Intelligence" },
];

const sidebarSectionsTop: NavSection[] = [
  {
    label: "Terminal",
    items: [
      { href: "/",              label: "Dashboard" },
      { href: "/pnl",           label: "PnL Analytics" },
      { href: "/orders",        label: "Order Stream" },
    ],
  },
  {
    label: "Pure Reason",
    items: [
      { href: "/logic-arb",     label: "Logic Arbitrage" },
      { href: "/whale-shadow",  label: "Whale Shadow" },
      { href: "/intelligence",  label: "Market Intelligence" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/risk",          label: "Risk Radar" },
      { href: "/decision",      label: "Decision Chain" },
      { href: "/replay",        label: "Replay" },
    ],
  },
];

const sidebarSectionsBottom: NavSection[] = [];

const SIDEBAR_EDGE_INSET_REM = 0.5;
const SIDEBAR_RIGHT_GAP_PX = 30;

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.19.63-.44v-1.68c-2.55.56-3.09-1.08-3.09-1.08a2.43 2.43 0 0 0-1.03-1.34c-.83-.56.06-.55.06-.55a1.93 1.93 0 0 1 1.41.94 1.98 1.98 0 0 0 2.69.77 1.98 1.98 0 0 1 .59-1.25c-2.03-.23-4.17-1.01-4.17-4.52a3.55 3.55 0 0 1 .94-2.47 3.3 3.3 0 0 1 .09-2.43s.77-.25 2.53.95a8.86 8.86 0 0 1 4.61 0c1.76-1.2 2.53-.95 2.53-.95a3.3 3.3 0 0 1 .09 2.43 3.55 3.55 0 0 1 .94 2.47c0 3.52-2.14 4.28-4.18 4.5a2.24 2.24 0 0 1 .63 1.73v2.56c0 .25.17.52.64.43A9.25 9.25 0 0 0 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ModeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.55 1.55M17.75 17.75l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.55-1.55M17.75 6.25l1.55-1.55"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M10.37 3.05a1 1 0 0 1 1.26-.66l.52.17a1 1 0 0 0 .64 0l.52-.17a1 1 0 0 1 1.26.66l.27.8a1 1 0 0 0 .48.57l.76.39a1 1 0 0 1 .45 1.31l-.24.49a1 1 0 0 0 0 .66l.24.49a1 1 0 0 1-.45 1.31l-.76.39a1 1 0 0 0-.48.57l-.27.8a1 1 0 0 1-1.26.66l-.52-.17a1 1 0 0 0-.64 0l-.52.17a1 1 0 0 1-1.26-.66l-.27-.8a1 1 0 0 0-.48-.57l-.76-.39a1 1 0 0 1-.45-1.31l.24-.49a1 1 0 0 0 0-.66l-.24-.49a1 1 0 0 1 .45-1.31l.76-.39a1 1 0 0 0 .48-.57l.27-.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="8" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M14 7l5 5-5 5M19 12H9M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

type SettingsTab = "general" | "account" | "proxy" | "endpoints" | "advanced" | "about";
type MenuAction = { type: "href"; value: string } | { type: "tab"; value: SettingsTab };

function UserMenu({
  onOpenTab,
  onLogout,
}: {
  onOpenTab: (action: MenuAction) => void;
  onLogout: () => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = menuRef.current;
    if (!node || typeof node.animate !== "function") {
      return;
    }

    node.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );
  }, []);

  const items: { label: string; href?: string; openSettings?: boolean }[] = [
    { label: "API Keys",       href: "/keys" },
    { label: "Users & Quotas", href: "/users" },
    { label: "Billing",        href: "/billing" },
    { label: "Settings",       openSettings: true },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 z-20 mb-1 space-y-1"
      style={{ right: `${SIDEBAR_RIGHT_GAP_PX}px` }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex min-h-[30px] w-full items-center gap-2 rounded-[8px] bg-transparent px-2 py-[6px] text-left text-[14px] leading-[18px] font-medium text-[#4f4f4e] transition-colors duration-150 hover:bg-zinc-100 hover:text-[#1e1e1e] focus-visible:outline-none"
          onClick={() => {
            if (item.href) {
              onOpenTab({ type: "href", value: item.href });
            } else if (item.openSettings) {
              onOpenTab({ type: "tab", value: "profile" });
            }
          }}
        >
          <span>{item.label}</span>
        </button>
      ))}
      <button
        type="button"
        className="flex min-h-[30px] w-full items-center gap-2 rounded-[8px] bg-transparent px-2 py-[6px] text-left text-[14px] leading-[18px] font-medium text-[#4f4f4e] transition-colors duration-150 hover:bg-zinc-100 hover:text-[#1e1e1e] focus-visible:outline-none"
        onClick={onLogout}
      >
        <span>Log out</span>
      </button>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  href,
  isCurrent,
  label,
}: {
  href: string;
  isCurrent: boolean;
  label: string;
}) {
  return (
    <Link
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "relative flex h-[31px] w-full items-center gap-2 overflow-visible rounded-md border border-transparent px-2 text-[12.8694px] font-medium text-foreground/82 transition-colors hover:text-foreground",
        "after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md",
        isCurrent && "border-accent bg-accent text-foreground",
      )}
      href={href}
    >
      <span className="relative z-10 truncate">{label}</span>
    </Link>
  );
}



function SettingsModal({
  open,
  activeTab,
  onTabChange,
  onClose,
}: {
  open: boolean;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  const sidebarGroups: { title: string; items: { id: SettingsTab; label: string }[] }[] = [
    {
      title: "Account",
      items: [
        { id: "general", label: "General" },
        { id: "account", label: "Account" },
      ],
    },
    {
      title: "Network",
      items: [
        { id: "proxy", label: "Proxy" },
        { id: "endpoints", label: "Endpoints" }
      ],
    },
    {
      title: "System",
      items: [
        { id: "advanced", label: "Advanced" },
        { id: "about", label: "About" },
      ],
    },
  ];

  const currentLabel =
    sidebarGroups.flatMap((g) => g.items).find((i) => i.id === activeTab)?.label || "Settings";

  const renderAbout = () => (
    <div className="space-y-6">
      {/* Top Logo Section - Static, no filters or animations to avoid rendering artifacts/borders */}
      <div className="flex flex-col items-center justify-center pt-4 pb-2 opacity-[0.35] hover:opacity-100 transition-opacity duration-700 cursor-default">
        <Image 
          src="/topoo.png" 
          alt="Topoo Logo" 
          width={64}
          height={64}
          className="h-16 w-auto block m-0 p-0 border-0 outline-0 ring-0 bg-transparent select-none pointer-events-none" 
          priority
          decoding="sync"
        />
        <span className="text-[12px] font-sans text-muted-foreground/40 mt-1 select-none">{getFullVersionDisplay()}</span>
      </div>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        {/* Application Section */}
      <div className="space-y-2">
        <div className="px-1">
          <h4 className="text-sm font-medium text-foreground leading-none">Application</h4>
          <p className="text-xs text-muted-foreground mt-1">App information and updates</p>
        </div>
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="divide-y divide-border/50">
            <div className="flex items-center gap-3 p-4">
              <Image 
                src="/topoo.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 rounded-lg" 
                priority
                decoding="sync"
              />
              <div className="flex-1 space-y-0.5">
                <h4 className="text-[12px] font-medium text-foreground leading-none">topoo gateway</h4>
                <p className="text-[11px] text-muted-foreground/70 font-normal">Professional AI Gateway</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground leading-none">Software Update</p>
                <p className="text-xs text-muted-foreground/60">Check for the latest version</p>
              </div>
              <button className="h-7 text-[11px] font-medium px-3 gap-1.5 rounded-md border bg-background hover:bg-muted transition-colors flex items-center">
                 <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                 Check for Updates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="space-y-2">
        <div className="px-1">
          <h4 className="text-sm font-medium text-foreground leading-none">Resources</h4>
          <p className="text-xs text-muted-foreground mt-1">Useful links and credits</p>
        </div>
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="divide-y divide-border/50">
            <a href="https://github.com/lbjlaq/Antigravity-Manager" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-transparent hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground leading-none">Source Code</p>
                <p className="text-xs text-muted-foreground">View the project on GitHub</p>
              </div>
              <div className="size-7 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-1 1-1.35 2.25-1.27 3.5.07 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.21 1.25-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </div>
            </a>
            <div className="flex items-center justify-between p-4 bg-transparent border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground leading-none">Author</p>
                <p className="text-xs text-muted-foreground">Follow viosson</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground cursor-default">
                 <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                 viosson
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-transparent border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground leading-none">Support</p>
                <p className="text-xs text-muted-foreground">Sponsor the development</p>
              </div>
              <div className="size-7 rounded-md border border-border bg-background flex items-center justify-center text-pink-500/80">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div
        className="fixed left-[50%] top-[50%] z-50 flex !h-[min(92vh,1150px)] !min-h-[850px] !max-h-[1250px] !w-[min(85vw,1260px)] !min-w-[950px] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-lg border bg-background p-0 shadow-lg outline-none animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full w-full isolate text-left">
          {/* Sidebar */}
          <div className="w-[232px] flex-shrink-0 flex flex-col py-3 overflow-y-auto bg-background">
            <div className="px-3 mb-4">
              <h2 className="text-[13px] font-medium text-foreground tracking-tight">Settings</h2>
            </div>
            <nav className="flex flex-col px-3">
              {sidebarGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-0.5 mt-6 first:mt-0">
                  <p className="mb-1.5 px-2 text-xs font-medium text-foreground/52 tracking-tight">
                    {group.title}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full rounded-md px-2 py-1.5 text-left text-[13px] font-medium transition-all duration-200",
                        activeTab === item.id 
                          ? "bg-secondary text-foreground" 
                          : "text-[#5a5a59] hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <span style={{ textTransform: "none" }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex h-full min-w-0 flex-1 flex-col border-l border-border bg-muted/5">
            <div className="flex min-h-[44px] items-center justify-between px-4 py-2.5">
              <span id="settings-title" className="text-[13px] font-medium text-muted-foreground/80 tracking-tight">
                {currentLabel}
              </span>
              <button
                onClick={onClose}
                className="flex size-6 items-center justify-center rounded-md p-0 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close settings"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 content-scrollbar">
              {activeTab === "about" ? renderAbout() : 
               activeTab === "endpoints" ? <EndpointsTab /> : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-sm font-medium text-foreground tracking-tight">{currentLabel}</div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">This section is being synchronized with your Topoo account.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToWebsiteShell({
  title,
  subtitle,
  children,
  aside,
  hidePageHeader = false,
  constrainMain = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  aside?: ReactNode;
  hidePageHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { initialized, isAuthenticated, logout, user } = useTopooAuth();
  const [sidebarUserMenuOpen, setSidebarUserMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");
  const sidebarUserMenuRef = useRef<HTMLDivElement | null>(null);
  const nextPath = pathname || "/";
  const authHref = `/auth?next=${encodeURIComponent(nextPath)}`;

  useEffect(() => {
    if (!sidebarUserMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!sidebarUserMenuRef.current?.contains(target)) {
        setSidebarUserMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarUserMenuOpen]);

  useEffect(() => {
    if (!settingsModalOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSettingsModalOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [settingsModalOpen]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(authHref);
    }
  }, [authHref, initialized, isAuthenticated, router]);

  if (!initialized || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
        <div className="w-full px-5 lg:px-6">
          <div className="flex h-(--header-height) items-center gap-4">
            <div className="flex min-w-0 items-center gap-5">
              <Link
                aria-label="toWebsite home"
                href="/"
                className="hidden shrink-0 items-center rounded-lg px-3 lg:inline-flex"
              >
                <DocsBrand label="toWebsite" />
              </Link>
              <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
                {topNav.map((item) => (
                  <Link
                    key={item.href}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-foreground/72 transition-colors hover:text-foreground",
                      isActive(pathname, item.href) && "text-foreground",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden h-4 w-px bg-border lg:block" />
              <a
                className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground/72 transition-colors hover:text-foreground"
                href="https://github.com/viosson-d"
                rel="noreferrer"
                target="_blank"
              >
                <GitHubIcon />
                <span>Build</span>
              </a>
              <div className="hidden h-4 w-px bg-border lg:block" />
              <Button aria-label="Toggle theme" className="size-8" size="icon-sm" variant="ghost">
                <ModeIcon />
              </Button>
              <div className="hidden h-4 w-px bg-border lg:block" />
              {!initialized ? <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100" /> : null}
            </div>
          </div>
        </div>
      </header>
      <div className="w-full px-5 lg:px-6">
        <div className={aside ? "grid w-full gap-8 lg:grid-cols-[224px_minmax(0,1fr)_280px]" : "grid w-full gap-8 lg:grid-cols-[224px_minmax(0,1fr)]"}>
          <aside className="sticky top-[calc(var(--header-height)+0.6rem)] hidden mt-[0.6rem] h-[calc(100svh-5.6rem)] overflow-hidden lg:block">
            <div className="absolute top-8 z-10 h-8 w-56 shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
            <div className="absolute top-12 right-2 bottom-0 hidden w-px bg-linear-to-b from-transparent via-border to-transparent lg:block" />
            <div
              className="no-scrollbar flex h-full w-56 flex-col overflow-y-auto pt-9"
              style={{
                paddingInline: `${SIDEBAR_EDGE_INSET_REM}rem`,
                paddingBottom: `${SIDEBAR_EDGE_INSET_REM}rem`,
              }}
            >
              <div>
                {sidebarSectionsTop.map((section) => (
                  <section key={section.label} className="pt-6">
                    <p className="mb-2 px-2 text-xs font-medium text-foreground/52 tracking-tight">{section.label}</p>
                    <ul className="flex flex-col gap-0.5" style={{ paddingRight: `${SIDEBAR_RIGHT_GAP_PX}px` }}>
                      {section.items.map((item) => (
                        <li key={`${section.label}-${item.label}-${item.href}`}>
                          <SidebarLink href={item.href} isCurrent={isActive(pathname, item.href)} label={item.label} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="mt-auto pt-3">
                {sidebarSectionsBottom.map((section) => (
                  <section key={section.label} className="pt-2">
                    <p className="mb-1 px-2 text-xs font-medium text-foreground/45">{section.label}</p>
                    <ul className="flex flex-col gap-0.5" style={{ paddingRight: `${SIDEBAR_RIGHT_GAP_PX}px` }}>
                      {section.items.map((item) => (
                        <li key={`${section.label}-${item.label}-${item.href}`}>
                          <SidebarLink href={item.href} isCurrent={isActive(pathname, item.href)} label={item.label} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
                <div className="relative mt-2" style={{ paddingRight: `${SIDEBAR_RIGHT_GAP_PX}px` }} ref={sidebarUserMenuRef}>
                  {initialized && isAuthenticated && user ? (
                    <button
                      type="button"
                      className={cn(
                        "mt-1 flex h-[31px] w-full items-center gap-2 rounded-[8px] bg-transparent pl-2 pr-2 py-[6px] text-left transition-colors duration-100 hover:bg-zinc-100 focus-visible:outline-none",
                        sidebarUserMenuOpen && "bg-zinc-100",
                  )}
                      aria-haspopup="menu"
                      aria-expanded={sidebarUserMenuOpen}
                      onClick={() => setSidebarUserMenuOpen((current) => !current)}
                    >
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                        {((user.displayName || user.nickname || user.email || "U").trim().charAt(0).toUpperCase() || "U")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12.8694px] leading-[18px] font-medium text-[#5a5a59]">
                        {user.displayName || user.nickname || user.email || "Topoo user"}
                      </span>
                    </button>
                  ) : initialized ? (
                    <Link
                      href={authHref}
                      className="mt-1 flex h-[31px] w-full items-center gap-2 rounded-[8px] pl-2 pr-2 py-[6px] text-left transition-colors duration-100 hover:bg-zinc-100 focus-visible:outline-none"
                    >
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[12px] font-bold text-zinc-700">
                        ?
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-[#5a5a59]">
                        Account
                      </span>
                    </Link>
                  ) : null}
                  {sidebarUserMenuOpen ? (
                    <UserMenu
                      onOpenTab={(action) => {
                        setSidebarUserMenuOpen(false);
                        if (action.type === "href") {
                          void router.push(action.value);
                        } else {
                          setSettingsTab(action.value);
                          setSettingsModalOpen(true);
                        }
                      }}
                      onLogout={() => {
                        setSidebarUserMenuOpen(false);
                        void logout();
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className={cn(constrainMain && "mx-auto w-full max-w-[800px]")}>
              {hidePageHeader ? null : (
                <div className="mb-6 pt-8">
                  <h1 className="text-2xl font-medium tracking-normal">{title}</h1>
                  {subtitle ? <p className="mt-2 text-sm text-zinc-500/80">{subtitle}</p> : null}
                </div>
              )}
              {children}
            </div>
          </main>

          {aside ? (
            <aside className="hidden lg:block">
              <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto h-[90svh] overflow-hidden overscroll-none pb-8">
                <div className="no-scrollbar flex flex-col gap-4 overflow-y-auto px-2 pt-8">
                  {aside}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
      <SettingsModal open={settingsModalOpen} activeTab={settingsTab} onTabChange={setSettingsTab} onClose={() => setSettingsModalOpen(false)} />
    </div>
  );
}

export function SideCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4">
      <div className="text-[15px] font-bold text-zinc-950 tracking-tight uppercase">{title}</div>
      <div className="mt-2 text-[13px] text-zinc-500 font-normal leading-relaxed">{children}</div>
    </div>
  );
}

export function DataList({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4">
      <div className="text-[15px] font-bold text-zinc-950 tracking-tight uppercase">{title}</div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4 text-[13px]">
            <div className="text-zinc-500 font-normal">{row.name}</div>
            <div className="font-medium text-zinc-950 tabular-nums">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
