import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { adminService } from "@/services/adminService.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function buildUserFilterPayload(filters) {
    const filterList = [];

    // 🔍 Keyword: hoTen OR tenDangNhap OR email
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

    // 🎭 Vai trò
    if (filters.vaiTro && filters.vaiTro !== "ALL") {
        filterList.push({
            fieldName: "vaiTro",
            operation: "EQUALS",
            value: filters.vaiTro,
            logicType: "AND",
        });
    }

    // 🚦 Trạng thái
    if (filters.trangThai && filters.trangThai !== "ALL") {
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
        sorts: [
            {
                fieldName: "ngayTao",
                direction: "DESC",
            },
        ],
    };
}

export default function ViewUserListByAdmin() {
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
        { value: "1", label: "Active" },
        { value: "0", label: "Banned" },
    ];


    // ===== FETCH DATA =====
    useEffect(() => {
        fetchUsers();
    }, [filters.page, filters.size, filters.keyword, filters.vaiTro, filters.trangThai]);

    useEffect(() => {
        if (!location.state?.success) return;
        if (toastShownRef.current) return; // chặn lần 2

        toastShownRef.current = true;

        toast.success(
            location.state.message || "Tạo người dùng thành công"
        );

        navigate(location.pathname, { replace: true });
    }, []);




    async function fetchUsers() {
        try {
            const payload = buildUserFilterPayload(filters);

            const res = await adminService.filterUsersByAdmin(payload);

            const serverResponse = res.data;
            if (serverResponse?.status === 200) {
                const pageData = serverResponse.data;
                setUsers(pageData.content || []);
                setTotal(pageData.totalElements || 0);
            }
        } catch (error) {
            console.error("Lỗi chi tiết:", error.response?.data || error.message);
        }
    }

    // ===== HANDLERS =====

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
        <div className="h-screen w-full bg-gray-50 flex flex-col min-h-0">

            {/* ===== FILTER (KHÔNG SCROLL) ===== */}
            <div className="px-6 py-4 flex-none">
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
                                    onChange={(e) =>
                                        setFilters({ ...filters, keyword: e.target.value })
                                    }
                                    placeholder="VD: Nguyễn Văn A / nv_kho_01 / a@gmail.com"
                                    className="w-full h-10 px-3 text-sm 
            focus:ring-0
            focus-visible:ring-0
            focus-visible:outline-none"
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Lọc Vai trò
                                </Label>

                                <Select
                                    value={filters.vaiTro}
                                    onValueChange={(v) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            vaiTro: v,
                                            page: 0,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full h-10 px-3 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent
                                        position="popper"
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        className="bg-white z-50"
                                    >
                                        {ROLE_OPTIONS.map((r) => {
                                            const active = filters.vaiTro === r.value;

                                            return (
                                                <SelectItem
                                                    key={r.value}
                                                    value={r.value}
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                            : "focus:bg-gray-100"
                                                    }
                                                >
                                                    {r.label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Trạng thái
                                </Label>

                                <Select
                                    value={filters.trangThai}
                                    onValueChange={(v) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            trangThai: v,
                                            page: 0,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full h-10 px-3 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent
                                        position="popper"
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        className="z-50
                                        bg-white
                                        border border-gray-200
                                        shadow-lg
                                        rounded-md
                                              "
                                    >
                                        {STATUS_OPTIONS.map((s) => {
                                            const active = filters.trangThai === s.value;

                                            return (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                            : "focus:bg-gray-100"
                                                    }
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>


                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Columns: id, ten_dang_nhap, ho_ten, email, so_dien_thoai, vai_tro,
                                trang_thai_hoat_dong, ngay_tao
                            </span>

                            <div className="flex gap-2">
                                <Button variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="flex items-center gap-2 transition-all duration-300 hover:bg-black hover:text-white border-gray-300"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ===== TABLE (ĂN PHẦN CÒN LẠI) ===== */}
            <div className="px-6 pb-4 flex-1 min-h-0">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm h-full min-h-0">
                    <CardContent className="p-0 flex flex-col h-full min-h-0">

                        {/* Header bảng */}
                        <div className="p-4 border-b flex-none flex items-center justify-between">
                            <div className="text-sm font-semibold">Danh sách Users</div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">Tổng: {total}</span>
                                <Link to="/users/add">
                                    <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                                        + Add New User
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* TABLE SCROLL */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <Table className="w-full">

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
                                        <TableHead className="px-4 py-3">Actions</TableHead>
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
                                                {u.trangThai === 1 ? (
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
                                                {u.ngayTao
                                                    ? new Date(u.ngayTao).toLocaleDateString("vi-VN")
                                                    : "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                                <Link
                                                    to={`/admin/users/${u.id}`}
                                                    className="text-sm font-semibold text-purple-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/users/${u.id}/edit-role`}
                                                    className="text-sm font-semibold text-gray-700 hover:underline"
                                                >
                                                    Role
                                                </Link>

                                                <Link
                                                    to={`/users/${u.id}/reset-password`}
                                                    className="text-sm font-semibold text-red-600 hover:underline"
                                                >
                                                    Reset
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </div>

                        {/* PAGINATION – LUÔN HIỆN */}
                        <div className="p-4 border-t flex-none bg-white">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Showing {users.length} / {total}
                                </span>

                                <div className="flex items-center gap-4">
                                    {/* Page size */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs text-gray-500">Rows:</Label>

                                        <Select
                                            value={String(filters.size)}
                                            onValueChange={(value) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    size: Number(value),
                                                    page: 0,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-20 px-2 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent
                                                position="popper"
                                                side="bottom"
                                                align="start"
                                                sideOffset={4}
                                                className="
                z-50
                bg-white
                border border-gray-200
                shadow-lg
                rounded-md
            "
                                            >
                                                {[10, 20, 30, 40, 50].map((s) => {
                                                    const active = String(filters.size) === String(s);

                                                    return (
                                                        <SelectItem
                                                            key={s}
                                                            value={String(s)}
                                                            className={
                                                                active
                                                                    ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                                    : "focus:bg-gray-100"
                                                            }
                                                        >
                                                            {s}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    {/* Pagination */}
                                    <div className="flex items-center gap-2">
                                        {/* Prev */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={filters.page === 0}
                                            onClick={() =>
                                                setFilters((p) => ({ ...p, page: p.page - 1 }))
                                            }
                                        >
                                            Prev
                                        </Button>

                                        {/* Pages */}
                                        {[1, 2, 3].map((p) => {
                                            if (p > totalPages) return null;

                                            const active = filters.page + 1 === p;

                                            return (
                                                <Button
                                                    key={p}
                                                    size="sm"
                                                    onClick={() =>
                                                        setFilters((prev) => ({ ...prev, page: p - 1 }))
                                                    }
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white hover:bg-purple-600"
                                                            : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                                                    }
                                                >
                                                    {p}
                                                </Button>
                                            );
                                        })}

                                        {/* ... */}
                                        {totalPages > 4 && (
                                            <span className="px-2 text-gray-500">...</span>
                                        )}

                                        {/* Last page */}
                                        {totalPages > 3 && (() => {
                                            const active = filters.page + 1 === totalPages;

                                            return (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        setFilters((prev) => ({ ...prev, page: totalPages - 1 }))
                                                    }
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white hover:bg-purple-600"
                                                            : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
                                                    }
                                                >
                                                    {totalPages}
                                                </Button>
                                            );
                                        })()}

                                        {/* Next */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={filters.page + 1 >= totalPages}
                                            onClick={() =>
                                                setFilters((p) => ({ ...p, page: p.page + 1 }))
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            </div>
        </div>
    );
}