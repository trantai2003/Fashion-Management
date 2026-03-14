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
import { Boxes, ChevronDown } from "lucide-react";
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
    <Sidebar
      collapsible="icon"
      className="border-r border-[#b8860b]/20 bg-gradient-to-b from-[#fffaf0] to-[#f6f1e6] text-[#3d3529]"
    >
      <SidebarHeader className="border-b border-[#b8860b]/15">
        {open ? (
          // ===== SIDEBAR MỞ =====
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#e0b22e] via-[#c99a17] to-[#b8860b] text-white shadow-[0_6px_14px_rgba(184,134,11,0.3)]">
              <Boxes className="h-4.5 w-4.5" strokeWidth={2.2} />
            </div>
            <div className="flex items-end gap-2 leading-none">
              <span
                className="text-[36px] text-[#c99615]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, letterSpacing: "-0.04em" }}
              >
                FS
              </span>
              <span
                className="pb-1 text-[18px] text-[#3a362f]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, letterSpacing: "-0.02em" }}
              >
                WMS
              </span>
            </div>
          </div>
        ) : (
          // ===== SIDEBAR THU GỌN =====
          <div className="flex items-center justify-center py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#b8860b]/20 bg-gradient-to-br from-[#d4a72b] to-[#b8860b] text-white shadow-md">
              <Boxes className="h-5 w-5" />
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
                        <SidebarMenuButton
                          className={isParentActive
                            ? "bg-[#f3e5bc] text-[#7a5700] font-semibold"
                            : "text-[#4a3f2f] hover:bg-[#f7edd3] hover:text-[#7a5700]"
                          }
                        >
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
                          {item.children
                            .filter((child) => !child.roles || child.roles.includes(role))
                            .map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                className={({ isActive }) =>
                                  `block rounded-md px-3 py-2 text-sm ${isActive
                                    ? "bg-[#f3e5bc] text-[#7a5700] font-semibold"
                                    : "text-[#5b4c36] hover:bg-[#f7edd3] hover:text-[#7a5700]"
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
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-[#f3e5bc] text-[#7a5700] font-semibold"
                          : "text-[#4a3f2f] hover:bg-[#f7edd3] hover:text-[#7a5700]"
                      }
                    >
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
        <SidebarFooter className="border-t border-[#b8860b]/15 bg-[#f6f1e6]">
          <div className="px-2 py-3">
            <p
              className="text-[9px] uppercase tracking-[0.32em] text-[#b8860b]/85"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              FASHION WAREHOUSE SYSTEM
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
