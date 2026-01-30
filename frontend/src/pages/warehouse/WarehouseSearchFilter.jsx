import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WarehouseSearchFilter({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) {
    return (
        <Card className="overflow-visible">
            <CardContent className="p-6 overflow-visible">
                <div className="flex flex-col md:flex-row gap-4 overflow-visible">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm theo tên, mã kho hoặc địa chỉ..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between bg-white">
                                    {filterStatus === "all" && "Tất cả trạng thái"}
                                    {filterStatus === "active" && "Đang hoạt động"}
                                    {filterStatus === "inactive" && "Không hoạt động"}
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl">
                                <DropdownMenuItem
                                    onClick={() => setFilterStatus("all")}
                                    className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100"
                                >
                                    Tất cả trạng thái
                                    {filterStatus === "all" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilterStatus("active")}
                                    className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100"
                                >
                                    Đang hoạt động
                                    {filterStatus === "active" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilterStatus("inactive")}
                                    className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100"
                                >
                                    Không hoạt động
                                    {filterStatus === "inactive" && <Check className="h-4 w-4" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
