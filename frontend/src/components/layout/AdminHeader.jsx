import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {

  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export default function AdminHeader({
  title,
  subtitle,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="h-16 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>


        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="Admin Avatar" />
                  <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
                    A
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium text-gray-700">
                  Admin
                </span>

                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="
      w-44
      bg-white
      z-50
      border border-gray-200
      shadow-lg
      rounded-md
      p-1
    "
            >
              <DropdownMenuItem
                className="text-sm px-3 py-2 rounded-sm focus:bg-gray-100 cursor-pointer"
              >
                Hồ sơ
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-sm px-3 py-2 rounded-sm focus:bg-gray-100 cursor-pointer"
              >
                Đổi mật khẩu
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-gray-200" />

              <DropdownMenuItem
                className="
        text-sm px-3 py-2 rounded-sm
        text-red-600
        focus:bg-red-50
        cursor-pointer
      "
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
