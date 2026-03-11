import { useEffect, useState, useRef, useCallback } from "react";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { adminService } from "@/services/adminService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function buildUserFilterPayload(filters) {
    const filterList = [];

    if (filters.keyword?.trim()) {
        ["hoTen", "tenDangNhap", "email"].forEach((field) => {
            filterList.push({
                fieldName: field,
                operation: "ILIKE",
                value: filters.keyword.trim(),
                logicType: "OR",
            });
        });
    }

    if (filters.vaiTro !== "ALL") {
        filterList.push({
            fieldName: "vaiTro",
            operation: "EQUALS",
            value: filters.vaiTro,
            logicType: "AND",
        });
    }

    if (filters.trangThai !== "ALL") {
        filterList.push({
            fieldName: "trangThai",
            operation: "EQUALS",
            value: Number(filters.trangThai),
            logicType: "AND",
        });
    }

    return {
        page: filters.page,
        size: filters.size,
        filters: filterList,
        sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
    };
}

export default function ViewUserListByAdmin() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        keyword: "",
        vaiTro: "ALL",
        trangThai: "ALL",
        page: 0,
        size: 10,
    });

    const location = useLocation();
    const toastShownRef = useRef(false);
    const navigate = useNavigate();

    const ROLE_OPTIONS = [
        { value: "ALL", label: "Tất cả" },
        { value: "quan_tri_vien", label: "Quản trị viên" },
        { value: "quan_ly_kho", label: "Quản lý kho" },
        { value: "nhan_vien_kho", label: "Nhân viên kho" },
        { value: "nhan_vien_ban_hang", label: "Nhân viên bán hàng" },
        { value: "nhan_vien_mua_hang", label: "Nhân viên mua hàng" },
        { value: "khach_hang", label: "Khách hàng" },
    ];

    const STATUS_OPTIONS = [
        { value: "ALL", label: "Tất cả" },
        { value: "1", label: "Hoạt động" },
        { value: "0", label: "Bị khóa" },
    ];

    const fetchUsers = useCallback(async () => {
        try {
            const payload = buildUserFilterPayload(filters);

            const res = await adminService.filterUsersByAdmin(payload);

            if (res.data?.status === 200) {
                const pageData = res.data.data;

                setUsers(pageData.content || []);
                setTotal(pageData.totalElements || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách người dùng");
        }
    }, [filters]);
    const pagination = {
        pageNumber: filters.page,
        pageSize: filters.size,
        totalElements: total,
        totalPages: Math.max(Math.ceil(total / filters.size), 1),
    };
    function handlePageChange(newPage) {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setFilters((prev) => ({
                ...prev,
                page: newPage,
            }));
        }
    }

    function handlePageSizeChange(newSize) {
        setFilters((prev) => ({
            ...prev,
            size: newSize,
            page: 0,
        }));
    }

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (!location.state?.success) return;
        if (toastShownRef.current) return;

        toastShownRef.current = true;

        toast.success(location.state.message || "Tạo người dùng thành công");

        navigate(location.pathname, { replace: true });
    }, []);

    const totalPages = Math.max(Math.ceil(total / filters.size), 1);

    const formatRole = (role) =>
        ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
    function StatusBadge({ status }) {
        return status === 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Hoạt động
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Bị khóa
            </span>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-end">
                <Link to="/users/add">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        + Thêm người dùng
                    </Button>
                </Link>
            </div>

            {/* FILTER */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5 text-purple-600" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* SEARCH */}
                        <div className="md:col-span-2 space-y-2">
                            <Label>Tìm kiếm</Label>

                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                                <Input
                                    className="pl-9"
                                    placeholder="Tên / username / email"
                                    value={filters.keyword}
                                    onChange={(e) =>
                                        setFilters((p) => ({
                                            ...p,
                                            keyword: e.target.value,
                                            page: 0,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* ROLE */}
                        <div className="space-y-2">
                            <Label>Vai trò</Label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {ROLE_OPTIONS.find((r) => r.value === filters.vaiTro)?.label}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-white shadow-lg border border-gray-100 z-50">
                                    {ROLE_OPTIONS.map((r) => (
                                        <DropdownMenuItem
                                            key={r.value}
                                            onClick={() =>
                                                setFilters((p) => ({ ...p, vaiTro: r.value, page: 0 }))
                                            }
                                        >
                                            {r.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* STATUS */}
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {STATUS_OPTIONS.find((s) => s.value === filters.trangThai)
                                            ?.label}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-white shadow-lg border border-gray-100 z-50">
                                    {STATUS_OPTIONS.map((s) => (
                                        <DropdownMenuItem
                                            key={s.value}
                                            onClick={() =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    trangThai: s.value,
                                                    page: 0,
                                                }))
                                            }
                                        >
                                            {s.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* TABLE */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Username</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Họ tên</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Email</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">SĐT</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Vai trò</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Trạng thái</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Ngày tạo</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-14 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="h-8 w-8 text-gray-300" />
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {users.map((u) => (
                                <tr
                                    key={u.id}
                                    onClick={() => navigate(`/users/${u.id}`)}
                                    className="hover:bg-violet-50/50 transition cursor-pointer"
                                >
                                    <td className="px-4 py-3 font-semibold">
                                        {u.tenDangNhap}
                                    </td>

                                    <td className="px-4 py-3">{u.hoTen}</td>

                                    <td className="px-4 py-3 text-slate-600">{u.email}</td>

                                    <td className="px-4 py-3 text-slate-600">{u.soDienThoai}</td>

                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2.5 py-1 text-xs rounded-lg bg-blue-50 text-blue-700">
                                            {formatRole(u.vaiTro)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={u.trangThai} />
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        {u.ngayTao
                                            ? new Date(u.ngayTao).toLocaleDateString("vi-VN")
                                            : "-"}
                                    </td>

                                    <td className="px-4 py-3 text-center space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-700 hover:text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/users/${u.id}/reset-password`);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Page size */}
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 whitespace-nowrap">
                                Hiển thị:
                            </Label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[120px] justify-between font-normal bg-white border-gray-200"
                                    >
                                        {pagination.pageSize} dòng
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100">
                                    {[5, 10, 20, 50, 100].map((size) => (
                                        <DropdownMenuItem
                                            key={size}
                                            onClick={() => handlePageSizeChange(size)}
                                            className="cursor-pointer"
                                        >
                                            {size} dòng
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Page info */}
                        <div className="text-sm text-gray-600">
                            Hiển thị{" "}
                            <span className="font-semibold text-gray-900">
                                {pagination.pageNumber * pagination.pageSize + 1}
                            </span>{" "}
                            -{" "}
                            <span className="font-semibold text-gray-900">
                                {Math.min(
                                    (pagination.pageNumber + 1) * pagination.pageSize,
                                    pagination.totalElements
                                )}
                            </span>{" "}
                            trong tổng số{" "}
                            <span className="font-semibold text-purple-600">
                                {pagination.totalElements}
                            </span>{" "}
                            kết quả
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 0}
                                className="gap-1 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>

                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let pageNum;

                                    if (pagination.totalPages <= 5) {
                                        pageNum = idx;
                                    } else if (pagination.pageNumber < 3) {
                                        pageNum = idx;
                                    } else if (pagination.pageNumber > pagination.totalPages - 4) {
                                        pageNum = pagination.totalPages - 5 + idx;
                                    } else {
                                        pageNum = pagination.pageNumber - 2 + idx;
                                    }

                                    return (
                                        <Button
                                            key={idx}
                                            variant={pagination.pageNumber === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={
                                                pagination.pageNumber === pageNum
                                                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                                                    : "border-gray-200"
                                            }
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                className="gap-1 disabled:opacity-50"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}