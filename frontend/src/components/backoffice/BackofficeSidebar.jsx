import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { NavLink, useLocation } from "react-router-dom";
import { Package, ChevronDown } from "lucide-react";
import { SIDEBAR_MENU } from "./sidebar.config";

export default function BackofficeSidebar({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const filteredMenu = SIDEBAR_MENU.filter(
    (item) => !item.roles || !role || item.roles.includes(role)
  );

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen flex w-full overflow-hidden">

        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-purple-700">
                FashionFlow
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto">
            <SidebarGroup>
              <SidebarMenu>

                {filteredMenu.map((item) => {
                  const Icon = item.icon;
                  const isParentActive =
                    item.children?.some((c) =>
                      location.pathname.startsWith(c.to)
                    );

                  // ===== MENU CÓ CON =====
                  if (item.children) {
                    const visibleChildren = item.children.filter(
                      (child) =>
                        !child.roles || !role || child.roles.includes(role)
                    );

                    if (visibleChildren.length === 0) return null;

                    return (
                      <Collapsible
                        key={item.label}
                        defaultOpen={isParentActive}
                        className="group"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={
                                isParentActive
                                  ? "bg-purple-50 text-purple-700 font-semibold"
                                  : ""
                              }
                            >
                              <Icon />
                              <span>{item.label}</span>
                              <ChevronDown className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                        </SidebarMenuItem>

                        <CollapsibleContent>
                          <div className="ml-8 mt-1 space-y-1">
                            {visibleChildren.map((child) => {
                              const active =
                                location.pathname.startsWith(child.to);

                              return (
                                <NavLink
                                  key={child.to}
                                  to={child.to}
                                  className={`block rounded-md px-3 py-2 text-sm
                                    ${
                                      active
                                        ? "bg-purple-100 text-purple-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                  {child.label}
                                </NavLink>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  // ===== MENU ĐƠN =====
                  const active = location.pathname.startsWith(item.to);

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={
                          active
                            ? "bg-purple-50 text-purple-700 font-semibold"
                            : ""
                        }
                      >
                        <NavLink to={item.to}>
                          <Icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-2 text-xs text-muted-foreground">
              © 2026 FashionFlow
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-hidden">
          {children}
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}
