import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSidebar } from "@/components/ui/sidebar";

export default function BackofficeHeader({
  title,
  subtitle,
  routeKey,
}) {
  const { toggleSidebar, open } = useSidebar();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  let userId = null;
  let username = "Admin";

  if (token) {
    try {
      const payload = jwtDecode(token);
      userId = payload.userId || payload.id || payload.sub;
      username = payload.tenDangNhap || payload.username || "Admin";
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const isWarehouseHeader = routeKey === "WAREHOUSE";

  const luxuryDetailHeaderKeys = new Set([
    "LOT_INPUT",
    "GOODS_RECEIPTS_DETAIL",
    "GOODS_ISSUES_CREATE",
    "GOODS_ISSUES_DETAIL",
    "PICK_LOT",
    "CREATE_TRANSFER_TICKET",
    "TRANSFER_TICKET_DETAIL",
    "STOCK_TAKE_DETAIL",
    "STOCK_TAKE_CREATE",
    "CUSTOMER_DETAIL",
    "CUSTOMER_EDIT",
    "CREATE_SALES_ORDER",
    "SALES_ORDER_DETAIL",
    "SUPPLIER_DETAIL",
    "SUPPLIER_EDIT",
    "PURCHASE_ORDER_CREATE",
    "GOODS_RECEIPTS_CREATE",
    "SUPPLIER_CREATE",
    "CHI_TIET_SAN_PHAM",
    "INVENTORY_REPORT",
    "SALES_INVOICE_PRINT",
    "USER_DETAIL",
    "PURCHASE_REQUEST_QUOTATION",
    "QUOTATION_REQUEST",
    "PURCHASE_REQUEST_CREATE",
    "PURCHASE_ORDER_CREATE",
    "QUOTATION_REQUEST_CREATE",
  ]);

  const isLuxuryDetailHeader = routeKey ? luxuryDetailHeaderKeys.has(routeKey) : false;

  const mainHeaderKeys = new Set([
    "DASHBOARD",
    "USER_LIST",
    "ADD_USER",
    "ATTRIBUTES",
    "MATERIALS",
    "PRODUCTS",
    "SKU_BUILDER",
    "SUPPLIERS",
    "WAREHOUSE",
    "GOODS_RECEIPTS",
    "GOODS_ISSUES",
    "PURCHASE_REQUESTS",
    "PURCHASE_ORDERS",
    "TRANSFER_TICKETS",
    "STOCK_TAKE_LIST",
    "DANH_MUC_QUAN_AO",
    "SALES_ORDERS",
    "CUSTOMERS",
    "BAO_CAO_DOANH_THU",
    "BAO_CAO_KHACH_HANG",
    "BAO_CAO_NHAP_XUAT",
    "LICH_SU_GIAO_DICH_KHO", // ← thêm vào đây
  ]);

  const isMainScreenHeader = routeKey ? mainHeaderKeys.has(routeKey) : false;

  const headerEyebrow = isWarehouseHeader
    ? "FS WMS · INVENTORY"
    : "FS WMS - TECHNOLOGY SOLUTION";

  const mainTitle = isWarehouseHeader ? "Quản lý kho hàng" : title;

  const buildTwoToneTitle = (rawTitle, key) => {
    if (!rawTitle || typeof rawTitle !== "string") {
      return { base: "", accent: "" };
    }

    const words = rawTitle.trim().split(/\s+/).filter(Boolean);
    const splitIndex = key === "ADD_USER" ? 1 : 2;

    if (words.length <= splitIndex) {
      return { base: words.join(" "), accent: "" };
    }

    return {
      base: words.slice(0, splitIndex).join(" "),
      accent: words.slice(splitIndex).join(" "),
    };
  };

  // "Lịch sử giao dịch kho" → base: "Lịch sử" | accent: "giao dịch kho"
  const { base: mainTitleBase, accent: mainTitleAccent } = buildTwoToneTitle(mainTitle, routeKey);

  return (
    <header className="sticky top-0 z-40 border-b border-[#b8860b]/20 bg-[#fffaf0]">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-[#5b4c36] hover:bg-[#f2e4bc] hover:text-[#7a5700]"
          >
            {open ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>

          {isMainScreenHeader ? (
            <div className="flex flex-col gap-0.5">
              <p
                className="text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-[#b8860b]/80"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {headerEyebrow}
              </p>
              <h1
                className="text-[20px] md:text-[24px] lg:text-[26px] leading-tight font-black text-[#1a1612]"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}
              >
                {mainTitleBase}
                {mainTitleAccent ? (
                  <>
                    {" "}
                    <span className="text-[#b8860b]">{mainTitleAccent}</span>
                  </>
                ) : null}
              </h1>
            </div>
          ) : isLuxuryDetailHeader ? (
            <div className="flex flex-col gap-0.5">
              <p
                className="text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-[#b8860b]/80"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {headerEyebrow}
              </p>
              <h1
                className="text-[20px] md:text-[24px] lg:text-[26px] leading-tight font-black text-[#1a1612]"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}
              >
                {mainTitleBase}
                {mainTitleAccent ? (
                  <>
                    {" "}
                    <span className="text-[#b8860b]">{mainTitleAccent}</span>
                  </>
                ) : null}
              </h1>
            </div>
          ) : (
            <div>
              <h1 className="text-base md:text-lg font-bold text-[#1a1612]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#7a6e5f]">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-[#f2e4bc]"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="Admin Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-[#d4a72b] to-[#b8860b] text-white text-sm font-semibold">
                    {username ? username.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#4a3f2f]">
                  {username}
                </span>
                <ChevronDown className="h-4 w-4 text-[#7a6e5f]" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-52 bg-gradient-to-b from-[#fffaf0] to-[#f7f0df] z-50 border border-[#b8860b]/25 shadow-[0_16px_40px_rgba(122,87,0,0.18)] rounded-xl p-1.5"
            >
              <DropdownMenuItem asChild disabled={!userId}>
                <Link
                  to={`/user/${userId}`}
                  className="text-sm px-3 py-2 rounded-md focus:bg-[#f2e4bc] text-[#4a3f2f] cursor-pointer"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Hồ sơ
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-sm px-3 py-2 rounded-md focus:bg-[#f2e4bc] text-[#4a3f2f] cursor-pointer"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Đổi mật khẩu
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-[#b8860b]/20" />

              <DropdownMenuItem asChild>
                <Link
                  to="/store"
                  className="text-sm px-3 py-2 rounded-md focus:bg-[#f2e4bc] text-[#4a3f2f] cursor-pointer flex items-center gap-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <ShoppingBag className="h-4 w-4 text-[#b8860b]" />
                  Về cửa hàng
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-[#b8860b]/20" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-sm px-3 py-2 rounded-md text-[#b24a2d] focus:bg-[#fde9df] cursor-pointer"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}