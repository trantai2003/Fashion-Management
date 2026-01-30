import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { NavLink, useLocation } from "react-router-dom";
import { Package, ChevronDown } from "lucide-react";
import { SIDEBAR_MENU } from "./sidebar.config";
import { useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
export default function BackofficeSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const role = localStorage.getItem("role");
  const { open } = useSidebar();
  const filteredMenu = SIDEBAR_MENU.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
  useEffect(() => {
    if (!open) return;

    const autoOpen = {};
    SIDEBAR_MENU.forEach((item) => {
      if (
        item.children &&
        item.children.some((c) => location.pathname.startsWith(c.to))
      ) {
        autoOpen[item.label] = true;
      }
    });

    setOpenMenus((prev) => ({ ...prev, ...autoOpen }));
  }, [location.pathname, open]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {open ? (
          // ===== SIDEBAR MỞ =====
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-purple-700">
              FashionFlow
            </span>
          </div>
        ) : (
          // ===== SIDEBAR THU GỌN =====
          <div className="flex items-center justify-center py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow">
              <Package className="h-5 w-5" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isParentActive =
                item.children?.some((c) =>
                  location.pathname.startsWith(c.to)
                );

              if (item.children) {
                const isOpen = open && openMenus[item.label];

                return (
                  <Collapsible
                    key={`${item.label}-${open}`}
                    open={isOpen}
                    onOpenChange={(value) =>
                      setOpenMenus((prev) => ({
                        ...prev,
                        [item.label]: value,
                      }))
                    }
                    className="group"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Icon />
                          <span>{item.label}</span>

                          {open && (
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    {open && (
                      <CollapsibleContent>
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              className={({ isActive }) =>
                                `block rounded-md px-3 py-2 text-sm ${isActive
                                  ? "bg-purple-100 text-purple-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
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

      {open && (
        <SidebarFooter>
          <div className="px-2 text-xs text-muted-foreground">
            © 2026 FashionFlow
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
