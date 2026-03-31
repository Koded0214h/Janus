import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ScrollText,
  History,
  ShieldCheck,
  Fingerprint,
  Settings,
  PlusCircle,
  Lock,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/Sidebar';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'AI Agent',
    url: '#',
    icon: Bot,
  },
  {
    title: 'Policies',
    url: '/policies',
    icon: ScrollText,
  },
  {
    title: 'Activity',
    url: '/activity',
    icon: History,
  },
  {
    title: 'Security',
    url: '/security',
    icon: ShieldCheck,
  },
  {
    title: 'ZK Passport',
    url: '/zk-passport',
    icon: Fingerprint,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function JanusSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-outline-variant/10 bg-background">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center shrink-0">
            <Lock className="text-on-primary w-5 h-5" />
          </div>
          {state === 'expanded' && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-black text-primary tracking-tighter uppercase leading-none truncate">
                Janus Protocol
              </h1>
              <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mt-1 truncate">
                The Digital Vault
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={
                      location.pathname === item.url
                        ? 'bg-surface-container text-primary font-bold'
                        : 'text-on-surface-variant hover:text-white hover:bg-surface-container'
                    }
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={state === 'expanded' ? 'p-4' : 'p-2'}>
        <button
          className={`
            bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2
            ${
              state === 'expanded'
                ? 'w-full py-3 rounded-sm text-[10px]'
                : 'w-10 h-10 rounded-full mx-auto'
            }
          `}
        >
          <PlusCircle className="w-5 h-5" />
          {state === 'expanded' && <span>Connect Node</span>}
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
