import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem,} from "@/components/ui/select";
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell,} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { nguoiDungService } from "@/services/nguoiDungService";

export default function UserList() {
    // ===== STATE =====
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        keyword: "",
        vaiTro: "ALL",
        trangThai: "ALL",
        page: 0,
        size: 10,
    });

    // ===== FETCH DATA =====
    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page]);

    async function fetchUsers() {
        try {
            const payload = {
                keyword: filters.keyword || null,
                vaiTro: filters.vaiTro === "ALL" ? null : filters.vaiTro,
                trangThaiHoatDong:
                    filters.trangThai === "ALL"
                        ? null
                        : Number(filters.trangThai),
                page: filters.page,
                size: filters.size,
            };

            const res = await nguoiDungService.filter(payload);

            setUsers(res?.data?.content || []);
            setTotal(res?.data?.totalElements || 0);
        } catch (error) {
            console.error("Fetch user list error:", error);
            setUsers([]);
            setTotal(0);
        }
    }

    // ===== HANDLERS =====
    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, page: 0 }));
        fetchUsers();
    };

    const handleReset = () => {
        setFilters({
            keyword: "",
            vaiTro: "ALL",
            trangThai: "ALL",
            page: 0,
            size: 10,
        });
    };

    const totalPages = Math.ceil(total / filters.size);

    return (
        <div className="h-full bg-gray-50">
            {/* MAIN CONTAINER – CHỈ 1 CÁI DUY NHẤT */}
            <div className="max-w-300 mx-auto px-4 py-4 space-y-4">

                {/* ===== Filter ===== */}
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid md:grid-cols-4 gap-4">

                            {/* Search */}
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Tìm theo tên / username / email
                                </Label>
                                <Input
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                    placeholder="VD: Nguyễn Văn A / nv_kho_01 / a@gmail.com"
                                    className="w-full h-10 px-3 text-sm border-gray-300 rounded-md focus-visible:ring-purple-500 shadow-none"
                                />
                            </div>

                            {/* Role */}
                            <div className="col-span-1 space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Lọc vai trò
                                </Label>
                                <Select
                                    value={filters.vaiTro}
                                    onValueChange={(v) =>
                                        setFilters({ ...filters, vaiTro: v })
                                    }
                                >
                                    <SelectTrigger
                                        className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300
                       bg-white flex items-center text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <SelectValue placeholder="Tất cả" className="leading-none" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="quan_tri_vien">quan_tri_vien</SelectItem>
                                        <SelectItem value="quan_ly_kho">quan_ly_kho</SelectItem>
                                        <SelectItem value="nhan_vien_kho">nhan_vien_kho</SelectItem>
                                        <SelectItem value="nhan_vien_ban_hang">nhan_vien_ban_hang</SelectItem>
                                        <SelectItem value="nhan_vien_mua_hang">nhan_vien_mua_hang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Trạng thái
                                </Label>
                                <Select
                                    value={filters.trangThai}
                                    onValueChange={(v) =>
                                        setFilters({ ...filters, trangThai: v })
                                    }
                                >
                                    <SelectTrigger
                                        className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300
                       bg-white flex items-center text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <SelectValue placeholder="Tất cả" className="leading-none" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        Columns: id, ten_dang_nhap, ho_ten, email, so_dien_thoai, vai_tro, trang_thai_hoat_dong, ngay_tao
      </span>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                    Reset
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={handleSearch}
                                >
                                    Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ===== Table ===== */}
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-0 flex flex-col">

                        {/* Table Header */}
                        <div className="p-4 flex items-center justify-between border-b">
                            <div className="text-sm font-semibold">Danh sách Users</div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">Tổng: {total}</span>
                                <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                                    + Add New User
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-105 overflow-auto">
                            <Table className="min-w-275">

                                <TableHeader>
                                    <TableRow className="bg-gray-50 text-xs text-gray-500">
                                        <TableHead className="px-4 py-3">ID</TableHead>
                                        <TableHead className="px-4 py-3">Username</TableHead>
                                        <TableHead className="px-4 py-3">Họ tên</TableHead>
                                        <TableHead className="px-4 py-3">Email</TableHead>
                                        <TableHead className="px-4 py-3">SĐT</TableHead>
                                        <TableHead className="px-4 py-3">Vai trò</TableHead>
                                        <TableHead className="px-4 py-3">Trạng thái</TableHead>
                                        <TableHead className="px-4 py-3">Ngày tạo</TableHead>
                                        <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="text-sm text-gray-800">
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-10 text-center text-gray-500">
                                                Không có dữ liệu
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {users.map((u) => (
                                        <TableRow key={u.id} className="border-b hover:bg-gray-50">
                                            <TableCell className="px-4 py-3">{u.id}</TableCell>
                                            <TableCell className="px-4 py-3 font-semibold">
                                                {u.tenDangNhap}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">{u.hoTen}</TableCell>
                                            <TableCell className="px-4 py-3">{u.email}</TableCell>
                                            <TableCell className="px-4 py-3">{u.soDienThoai}</TableCell>

                                            <TableCell className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                                                    {u.vaiTro}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {u.trangThaiHoatDong === 1 ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded bg-red-50 text-red-700">
                                                        Banned
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {u.ngayTao}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                                <button className="text-sm font-semibold text-purple-600 hover:underline">
                                                    View
                                                </button>
                                                <button className="text-sm font-semibold text-gray-700 hover:underline">
                                                    Role
                                                </button>
                                                <button className="text-sm font-semibold text-red-600 hover:underline">
                                                    Reset
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </div>


                        {/* Pagination */}
                        <div className="p-4 border-t flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Showing {users.length} / {total}
                            </span>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={filters.page === 0}
                                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>
                                    Prev
                                </Button>

                                <Button size="sm" className="bg-gray-900 text-white">
                                    {filters.page + 1}
                                </Button>

                                <Button variant="outline" size="sm"
                                    disabled={filters.page + 1 >= totalPages}
                                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
