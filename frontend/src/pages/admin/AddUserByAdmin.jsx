import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
    const [showPassword, setShowPassword] = useState(false);


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
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            {/* FORM CARD */}
            <Card className="border-0 shadow-lg bg-white max-w-3xl mx-auto rounded-2xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <Label className="font-semibold text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        Tên đăng nhập
                                    </Label>
                                    <Input
                                        placeholder="username"
                                        value={form.tenDangNhap}
                                        onChange={(e) =>
                                            setForm({ ...form, tenDangNhap: e.target.value })
                                        }
                                        className="mt-2 h-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="example@gmail.com"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        className="mt-2 h-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    />
                                </div>

                                <div>
                                    <Label className="font-semibold text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        Vai trò hệ thống
                                    </Label>
                                    <Select
                                        value={form.vaiTro}
                                        onValueChange={(v) =>
                                            setForm({ ...form, vaiTro: v })
                                        }
                                    >
                                        <SelectTrigger className="mt-2 h-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                            side="bottom"
                                            align="start"
                                            sideOffset={4}
                                            className="bg-white shadow-lg border border-[#b8860b]/20 z-50">
                                            <SelectItem value="nhan_vien_kho">
                                                Nhân viên kho
                                            </SelectItem>

                                            <SelectItem value="quan_ly_kho">
                                                Quản lý kho
                                            </SelectItem>

                                            <SelectItem value="nhan_vien_ban_hang">
                                                Nhân viên bán hàng
                                            </SelectItem>

                                            <SelectItem value="nhan_vien_mua_hang">
                                                Nhân viên mua hàng
                                            </SelectItem>

                                            <SelectItem value="quan_tri_vien">
                                                Quản trị viên
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label className="font-semibold text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        Họ và tên
                                    </Label>
                                    <Input
                                        placeholder="Nguyễn Văn A"
                                        value={form.hoTen}
                                        onChange={(e) =>
                                            setForm({ ...form, hoTen: e.target.value })
                                        }
                                        className="mt-2 h-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Số điện thoại</Label>
                                    <Input
                                        placeholder="090..."
                                        value={form.soDienThoai}
                                        onChange={(e) =>
                                            setForm({ ...form, soDienThoai: e.target.value })
                                        }
                                        className="mt-2 h-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    />
                                </div>

                                <div>
                                    <Label className="font-semibold text-[#7a6e5f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        Mật khẩu tạm thời
                                    </Label>
                                    <div className="relative mt-2">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={form.matKhau}
                                            onChange={(e) =>
                                                setForm({ ...form, matKhau: e.target.value })
                                            }
                                            className="h-10 pr-10 border-[#b8860b]/20 focus-visible:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 px-3 text-[#9a8564] hover:text-[#7a5700]"
                                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-[#b8860b]/15">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#b8860b]/30 text-[#7a6e5f] hover:bg-[#f7edd3] hover:text-[#7a5700]"
                                onClick={() => navigate("/users")}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-br from-[#d4a72b] to-[#b8860b] hover:from-[#c79616] hover:to-[#a97700] text-white shadow-md"
                            >
                                {loading ? "Đang lưu..." : "Lưu người dùng"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

}