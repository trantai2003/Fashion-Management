import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";

export default function AddUserByAdmin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        tenDangNhap: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        vaiTro: "nhan_vien_kho",
        matKhau: "",
    });

    const [loading, setLoading] = useState(false);

    // ===== SUBMIT =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await adminService.createUserByAdmin(form);
            navigate("/users", {
                state: {
                    success: true,
                    message: "Tạo người dùng thành công",
                },
            });
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Tên đăng nhập / Email / SĐT đã tồn tại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-8 max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>

                {/* ===== CARD ===== */}
                <Card className="bg-white border border-gray-200 rounded-t-2xl rounded-b-none shadow-sm">

                    <CardContent className="p-5 space-y-4">

                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label className="text-sm font-semibold text-gray-800">
                                    Tên đăng nhập <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="username"
                                    value={form.tenDangNhap}
                                    onChange={(e) =>
                                        setForm({ ...form, tenDangNhap: e.target.value })
                                    }
                                    className="mt-2 h-10 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-semibold text-gray-800">
                                    Họ và tên <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    value={form.hoTen}
                                    onChange={(e) =>
                                        setForm({ ...form, hoTen: e.target.value })
                                    }
                                    className="mt-2 h-10 rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label className="text-sm font-semibold text-gray-800">
                                    Email
                                </Label>
                                <Input
                                    placeholder="example@gmail.com"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="mt-2 h-10 rounded-lg"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-semibold text-gray-800">
                                    Số điện thoại
                                </Label>
                                <Input
                                    placeholder="090..."
                                    value={form.soDienThoai}
                                    onChange={(e) =>
                                        setForm({ ...form, soDienThoai: e.target.value })
                                    }
                                    className="mt-2 h-10 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-gray-800">
                                Vai trò (vai_tro)
                            </Label>

                            <Select
                                value={form.vaiTro}
                                onValueChange={(v) =>
                                    setForm({ ...form, vaiTro: v })
                                }
                            >
                                <SelectTrigger className="w-full h-10 px-3 text-sm rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                    className="bg-white z-50"
                                >
                                    {[
                                        { value: "nhan_vien_kho", label: "Nhân viên kho" },
                                        { value: "quan_ly_kho", label: "Quản lý kho" },
                                        { value: "nhan_vien_ban_hang", label: "Nhân viên bán hàng" },
                                        { value: "nhan_vien_mua_hang", label: "Nhân viên mua hàng" },
                                        { value: "quan_tri_vien", label: "Quản trị viên" },
                                    ].map((r) => {
                                        const active = form.vaiTro === r.value;

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

                        {/* Password */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-800">
                                Mật khẩu tạm thời <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="password"
                                value={form.matKhau}
                                onChange={(e) =>
                                    setForm({ ...form, matKhau: e.target.value })
                                }
                                className="mt-2 h-10 rounded-lg"
                                required
                            />
                        </div>
                    </CardContent>



                </Card>
                {/* ===== FOOTER ===== */}
                <div className="px-5 py-4 bg-gray-50 border border-gray-200 border-t border-t-gray-300/50 -mt-px flex justify-end gap-3 rounded-b-2xl shadow-sm">

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/users")}
                        className="h-10 px-5 rounded-lg"
                    >
                        Hủy
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-10 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {loading ? "Đang lưu..." : "Lưu người dùng"}
                    </Button>
                </div>
            </form>
        </div>
    );

}
