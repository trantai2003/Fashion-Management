import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "@/services/adminService.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function ViewUserDetailByAdmin() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loadingToggle, setLoadingToggle] = useState(false);

    const handleToggleStatus = async () => {
        try {
            setLoadingToggle(true);

            await adminService.toggleUserStatusByAdmin(id);

            // reload lại detail sau khi toggle
            const refreshed = await adminService.getByIdByAdmin(id);
            setUser(refreshed.data);

            toast.success("Cập nhật trạng thái tài khoản thành công");

        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                "Không thể cập nhật trạng thái tài khoản"
            );
        } finally {
            setLoadingToggle(false);
        }
    };

    useEffect(() => {
        adminService.getByIdByAdmin(id)
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.error("API ERROR =", err);
            });
    }, [id]);

    if (!user) {
        return (
            <div className="p-6 text-gray-500">
                Đang tải dữ liệu người dùng...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    to="/admin/users"
                    className="text-sm text-purple-600 font-semibold"
                >
                    ← Quay lại danh sách
                </Link>

                <div className="flex gap-2">
                    <Button variant="outline">Chỉnh sửa quyền</Button>
                    <Button
                        variant={user.trangThai === 1 ? "destructive" : "outline"}
                        className={
                            user.trangThai === 1
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700 border-green-600"
                        }
                        disabled={loadingToggle}
                        onClick={handleToggleStatus}
                    >
                        {loadingToggle
                            ? "Đang xử lý..."
                            : user.trangThai === 1
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"}
                    </Button>
                </div>
            </div>

            {/* ===== THÔNG TIN USER ===== */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Avatar + basic info */}
                <Card>
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        {/* Avatar wrapper – QUAN TRỌNG */}
                        <div className="flex justify-center w-full">
                            <Avatar className="h-24 w-24 shrink-0">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-3xl font-bold">
                                    {user.hoTen?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Name */}
                        <h2
                            className="text-xl font-bold
                       max-w-full
                       break-all
                       line-clamp-2"
                            title={user.hoTen}
                        >
                            {user.hoTen}
                        </h2>

                        {/* Username */}
                        <p
                            className="text-sm text-gray-500
                       max-w-full
                       break-all
                       truncate"
                            title={user.tenDangNhap}
                        >
                            @{user.tenDangNhap}
                        </p>

                        {/* Role */}
                        <Badge className="uppercase mt-1">
                            {user.vaiTro.replaceAll("_", " ")}
                        </Badge>
                    </CardContent>
                </Card>


                {/* Detail info */}
                <Card className="md:col-span-2">
                    <CardContent className="p-0 divide-y">
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Số điện thoại" value={user.soDienThoai} />
                        <InfoRow
                            label="Ngày tạo"
                            value={formatDate(user.ngayTao)}
                        />
                        <InfoRow
                            label="Trạng thái"
                            value={
                                user.trangThai === 1
                                    ? "Hoạt động"
                                    : "Bị khóa"
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {/* ===== KHO ĐƯỢC PHÂN QUYỀN PHỤ TRÁCH ===== */}
            {user.vaiTro !== "khach_hang" && (
                <Card>
                    <CardContent className="p-0">
                        <div className="px-4 py-3 border-b font-semibold">
                            Kho được phân quyền phụ trách
                        </div>

                        {user.khoPhuTrach && user.khoPhuTrach.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã Kho</TableHead>
                                        <TableHead>Tên Kho</TableHead>
                                        <TableHead>Vai trò tại kho</TableHead>
                                        <TableHead>Ngày cấp</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {user.khoPhuTrach.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {item.kho?.maKho || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {item.kho?.tenKho || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {item.vaiTroTaiKho
                                                        ? item.vaiTroTaiKho.replaceAll("_", " ")
                                                        : (item.laQuanLyKho === 1 ? "Quản lý" : "Nhân viên")
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(item.ngayTao)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-4 text-sm text-gray-500">
                                Người dùng chưa được phân quyền kho nào.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="p-4 grid grid-cols-3">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium col-span-2">
                {value}
            </span>
        </div>
    );
}

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("vi-VN");
}
