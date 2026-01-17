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

import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Boxes,
    Package,
    ShoppingCart,
    Warehouse,
    ArrowDownToLine,
    ArrowUpFromLine,
    Users,
    AlertCircle,
    BarChart3,
    Settings,
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Quản lý tồn kho", to: "/admin/inventory", icon: Boxes },
    { label: "Sản phẩm", to: "/admin/products", icon: Package },
    { label: "Đơn hàng", to: "/admin/orders", icon: ShoppingCart },
    { label: "Kho", to: "/admin/warehouse", icon: Warehouse },
    { label: "Nhập kho", to: "/admin/import", icon: ArrowDownToLine },
    { label: "Xuất kho", to: "/admin/export", icon: ArrowUpFromLine },
    { label: "Người dùng", to: "/admin/users", icon: Users },
    { label: "Cảnh báo", to: "/admin/alerts", icon: AlertCircle },
    { label: "Báo cáo", to: "/admin/reports", icon: BarChart3 },
    { label: "Cài đặt", to: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ children }) {
    const location = useLocation();

    return (
        // ✅ QUAN TRỌNG: h-screen + flex
        <SidebarProvider defaultOpen>
            <div className="h-screen flex overflow-hidden w-full">

                <Sidebar variant="sidebar" collapsible="icon">
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

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const active = location.pathname.startsWith(item.to);
                                    const Icon = item.icon;

                                    return (
                                        <SidebarMenuItem key={item.to}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={active}
                                                tooltip={item.label}
                                                className={
                                                    active
                                                        ? "bg-purple-50 text-purple-700 font-semibold"
                                                        : "text-gray-600 hover:bg-gray-50"
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

                {/* ✅ FIX LỚN NHẤT NẰM Ở ĐÂY */}
                <SidebarInset className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex flex-col h-full min-h-0">
                        {children}
                    </div>
                </SidebarInset>

            </div>
        </SidebarProvider>
    );
}
