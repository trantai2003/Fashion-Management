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
    User,
    Mail,
    Phone,
    Calendar,
    Warehouse
} from "lucide-react";

import { toast } from "sonner";


export default function ViewUserDetailByAdmin() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loadingToggle, setLoadingToggle] = useState(false);


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
            <div className="p-6 text-gray-500">
                Đang tải dữ liệu người dùng...
            </div>
        );
    }


    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <Link
                    to="/users"
                    className="flex items-center gap-2 text-sm font-semibold hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Link>


                <div className="flex gap-2">

                    <Button
                        variant="outline"
                        onClick={() => navigate(`/users/${user.id}/edit-role`)}
                    >
                        Chỉnh sửa quyền
                    </Button>


                    <Button
                        disabled={loadingToggle}
                        className={
                            user.trangThai === 1
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                        }
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


            {/* USER PROFILE */}
            <div className="grid md:grid-cols-3 gap-6">


                {/* LEFT CARD */}
                <Card className="border-0 shadow-md bg-white">

                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">

                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-3xl font-bold">
                                {user.hoTen?.charAt(0)}
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


                        <Badge className="uppercase">
                            {user.vaiTro.replaceAll("_", " ")}
                        </Badge>


                        <StatusBadge status={user.trangThai} />

                    </CardContent>

                </Card>



                {/* INFO CARD */}
                <Card className="md:col-span-2 border-0 shadow-md bg-white">

                    <CardContent className="divide-y">

                        <InfoRow
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={user.email}
                        />

                        <InfoRow
                            icon={<Phone className="h-4 w-4" />}
                            label="Số điện thoại"
                            value={user.soDienThoai}
                        />

                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label="Ngày tạo"
                            value={formatDate(user.ngayTao)}
                        />

                    </CardContent>

                </Card>

            </div>


            {/* WAREHOUSE PERMISSION */}
            {user.vaiTro !== "khach_hang" && (

                <Card className="border-0 shadow-md bg-white">

                    <CardContent className="p-0">

                        <div className="px-4 py-3 border-b font-semibold flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            Kho được phân quyền phụ trách
                        </div>


                        {user.khoPhuTrach?.length > 0 ? (

                            <div className="overflow-x-auto">

                                <Table>

                                    <TableHeader>

                                        <TableRow className="bg-slate-50">

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
                                                className="hover:bg-violet-50/50"
                                            >

                                                <TableCell className="font-semibold">
                                                    {item.kho?.maKho || "N/A"}
                                                </TableCell>

                                                <TableCell>
                                                    {item.kho?.tenKho || "N/A"}
                                                </TableCell>


                                                <TableCell>

                                                    <Badge variant="secondary">

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

                            <div className="p-6 text-sm text-gray-500 text-center">
                                Người dùng chưa được phân quyền kho nào
                            </div>

                        )}

                    </CardContent>

                </Card>

            )}

        </div>
    );
}



function InfoRow({ icon, label, value }) {

    return (
        <div className="p-4 flex items-center justify-between text-sm">

            <div className="flex items-center gap-2 text-gray-500">
                {icon}
                {label}
            </div>

            <div className="font-medium text-gray-900">
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