import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Warehouse,
    Shield,
    IdCard,
    Clock3,
    Building2,
    UserCog
} from "lucide-react";

import { toast } from "sonner";


export default function ViewUserDetailByAdmin() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loadingToggle, setLoadingToggle] = useState(false);

    const ROLE_LABELS = {
        quan_tri_vien: "Quản trị viên",
        quan_ly_kho: "Quản lý kho",
        nhan_vien_kho: "Nhân viên kho",
        nhan_vien_ban_hang: "Nhân viên bán hàng",
        nhan_vien_mua_hang: "Nhân viên mua hàng",
        khach_hang: "Khách hàng",
    };


    const handleToggleStatus = async () => {
        try {

            setLoadingToggle(true);

            await adminService.toggleUserStatusByAdmin(id);

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
                console.error(err);
            });

    }, [id]);


    if (!user) {
        return (
            <div className="lux-sync p-6 min-h-screen">
                <div className="max-w-6xl mx-auto rounded-2xl border border-[rgba(184,134,11,0.2)] bg-white px-6 py-8 text-sm text-[#7a6e5f] shadow-sm">
                    Đang tải dữ liệu người dùng...
                </div>
            </div>
        );
    }

    const isActive = user.trangThai === 1;
    const roleLabel = ROLE_LABELS[user.vaiTro] || user.vaiTro?.replaceAll("_", " ") || "Không xác định";
    const initials =
        user.hoTen
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((x) => x[0]?.toUpperCase())
            .join("") || "U";
    const warehouseCount = user.khoPhuTrach?.length || 0;


    return (
        <div className="lux-sync warehouse-unified gold-text-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

            {/* HEADER */}
            <div className="rounded-2xl border border-[rgba(184,134,11,0.18)] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Link
                            to="/users"
                            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[rgba(184,134,11,0.72)] hover:text-[#b8860b]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1a1612]">Chi tiết người dùng</h1>
                            <p className="mt-1 text-sm text-[#7a6e5f]">
                                Hồ sơ, trạng thái và quyền phụ trách kho của tài khoản
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="border-[rgba(184,134,11,0.28)] text-[#7a6e5f] hover:bg-[rgba(184,134,11,0.08)] hover:text-[#b8860b]"
                            onClick={() => navigate(`/users/${user.id}/edit-role`)}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Chỉnh sửa quyền
                        </Button>

                        <Button
                            disabled={loadingToggle}
                            className={
                                isActive
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }
                            onClick={handleToggleStatus}
                        >
                            {loadingToggle
                                ? "Đang xử lý..."
                                : isActive
                                    ? "Khóa tài khoản"
                                    : "Mở khóa tài khoản"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewTile
                    icon={<UserCog className="h-4 w-4 text-[#b8860b]" />}
                    label="Vai trò"
                    value={roleLabel}
                />
                <OverviewTile
                    icon={<Shield className="h-4 w-4 text-[#b8860b]" />}
                    label="Trạng thái"
                    value={isActive ? "Đang hoạt động" : "Đã khóa"}
                />
                <OverviewTile
                    icon={<Building2 className="h-4 w-4 text-[#b8860b]" />}
                    label="Kho phụ trách"
                    value={`${warehouseCount} kho`}
                />
                <OverviewTile
                    icon={<IdCard className="h-4 w-4 text-[#b8860b]" />}
                    label="Mã người dùng"
                    value={user.id || "N/A"}
                />
            </div>


            {/* USER PROFILE */}
            <div className="grid md:grid-cols-3 gap-6">


                {/* LEFT CARD */}
                <Card className="border border-[rgba(184,134,11,0.16)] shadow-sm bg-white overflow-hidden">

                    <div className="h-1 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent" />

                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">

                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-gradient-to-br from-[#b8860b] to-[#e8b923] text-white text-3xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>


                        <div>

                            <h2
                                className="text-xl font-bold break-all"
                                title={user.hoTen}
                            >
                                {user.hoTen}
                            </h2>


                            <p
                                className="text-sm text-gray-500 break-all"
                                title={user.tenDangNhap}
                            >
                                @{user.tenDangNhap}
                            </p>

                        </div>


                        <Badge variant="outline" className="uppercase border-[rgba(184,134,11,0.24)] bg-[rgba(184,134,11,0.08)] text-[#3d3529]">
                            {roleLabel}
                        </Badge>


                        <StatusBadge status={user.trangThai} />

                        <div className="w-full border-t border-[rgba(184,134,11,0.12)] pt-4 space-y-2 text-left">
                            <InfoMini
                                icon={<Calendar className="h-4 w-4" />}
                                label="Ngày tạo"
                                value={formatDate(user.ngayTao) || "N/A"}
                            />
                            <InfoMini
                                icon={<Clock3 className="h-4 w-4" />}
                                label="Cập nhật gần nhất"
                                value={formatDate(user.ngayCapNhat) || "N/A"}
                            />
                        </div>

                    </CardContent>

                </Card>



                {/* INFO CARD */}
                <Card className="md:col-span-2 border border-[rgba(184,134,11,0.16)] shadow-sm bg-white overflow-hidden">

                    <div className="px-4 py-3 border-b border-[rgba(184,134,11,0.12)] bg-[rgba(184,134,11,0.05)]">
                        <h3 className="text-sm font-semibold text-[#3d3529]">Thông tin liên hệ và hệ thống</h3>
                    </div>

                    <CardContent className="divide-y">

                        <InfoRow
                            icon={<IdCard className="h-4 w-4" />}
                            label="ID"
                            value={user.id || "N/A"}
                        />

                        <InfoRow
                            icon={<UserCog className="h-4 w-4" />}
                            label="Tên đăng nhập"
                            value={user.tenDangNhap ? `@${user.tenDangNhap}` : "N/A"}
                        />

                        <InfoRow
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={user.email || "N/A"}
                        />

                        <InfoRow
                            icon={<Phone className="h-4 w-4" />}
                            label="Số điện thoại"
                            value={user.soDienThoai || "N/A"}
                        />

                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label="Ngày tạo"
                            value={formatDate(user.ngayTao) || "N/A"}
                        />

                    </CardContent>

                </Card>

            </div>


            {/* WAREHOUSE PERMISSION */}
            {user.vaiTro !== "khach_hang" && (

                <Card className="border border-[rgba(184,134,11,0.16)] shadow-sm bg-white overflow-hidden">

                    <CardContent className="p-0">

                        <div className="px-4 py-3 border-b border-[rgba(184,134,11,0.12)] font-semibold flex items-center gap-2 bg-[rgba(184,134,11,0.05)] text-[#3d3529]">
                            <Warehouse className="h-4 w-4" />
                            Kho được phân quyền phụ trách
                        </div>


                        {user.khoPhuTrach?.length > 0 ? (

                            <div className="overflow-x-auto">

                                <Table>

                                    <TableHeader>

                                        <TableRow className="bg-[rgba(184,134,11,0.06)]">

                                            <TableHead>Mã Kho</TableHead>
                                            <TableHead>Tên Kho</TableHead>
                                            <TableHead>Vai trò</TableHead>
                                            <TableHead>Ngày cấp</TableHead>

                                        </TableRow>

                                    </TableHeader>


                                    <TableBody>

                                        {user.khoPhuTrach.map((item, index) => (

                                            <TableRow
                                                key={index}
                                                className="hover:bg-[rgba(184,134,11,0.08)]"
                                            >

                                                <TableCell className="font-semibold">
                                                    {item.kho?.maKho || "N/A"}
                                                </TableCell>

                                                <TableCell>
                                                    {item.kho?.tenKho || "N/A"}
                                                </TableCell>


                                                <TableCell>

                                                    <Badge variant="secondary" className="bg-[rgba(184,134,11,0.09)] text-[#3d3529] border border-[rgba(184,134,11,0.2)] hover:bg-[rgba(184,134,11,0.14)]">

                                                        {item.vaiTroTaiKho
                                                            ? item.vaiTroTaiKho.replaceAll("_", " ")
                                                            : item.laQuanLyKho === 1
                                                                ? "Quản lý"
                                                                : "Nhân viên"}

                                                    </Badge>

                                                </TableCell>


                                                <TableCell>
                                                    {formatDate(item.ngayTao)}
                                                </TableCell>

                                            </TableRow>

                                        ))}

                                    </TableBody>

                                </Table>

                            </div>

                        ) : (

                            <div className="p-6 text-sm text-[#7a6e5f] text-center">
                                Người dùng chưa được phân quyền kho nào
                            </div>

                        )}

                    </CardContent>

                </Card>

            )}

            </div>
        </div>
    );
}



function InfoRow({ icon, label, value }) {

    return (
        <div className="p-4 flex items-center justify-between gap-3 text-sm">

            <div className="flex items-center gap-2 text-[#7a6e5f] shrink-0">
                {icon}
                {label}
            </div>

            <div className="font-medium text-[#1a1612] text-right break-all">
                {value}
            </div>

        </div>
    );
}



function StatusBadge({ status }) {

    return status === 1 ? (

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Hoạt động

        </span>

    ) : (

        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">

            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

            Bị khóa

        </span>

    );
}



function formatDate(iso) {

    if (!iso) return "";

    return new Date(iso).toLocaleDateString("vi-VN");

}

function InfoMini({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 text-[#7a6e5f]">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-medium text-[#3d3529] text-right">{value}</span>
        </div>
    );
}

function OverviewTile({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-[rgba(184,134,11,0.16)] bg-white px-4 py-3 shadow-sm">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(184,134,11,0.12)]">
                {icon}
            </div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[rgba(184,134,11,0.74)]">{label}</p>
            <p className="mt-1 text-sm font-semibold text-[#1a1612]">{value}</p>
        </div>
    );
}