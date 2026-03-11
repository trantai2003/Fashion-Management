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
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            {/* FORM CARD */}
            <Card className="border-0 shadow-md bg-white max-w-3xl mx-auto">
                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ROW 1 */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label className="font-semibold">
                                    Tên đăng nhập
                                </Label>
                                <Input
                                    placeholder="username"
                                    value={form.tenDangNhap}
                                    onChange={(e) =>
                                        setForm({ ...form, tenDangNhap: e.target.value })
                                    }
                                    className="mt-2"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="font-semibold">
                                    Họ và tên
                                </Label>
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    value={form.hoTen}
                                    onChange={(e) =>
                                        setForm({ ...form, hoTen: e.target.value })
                                    }
                                    className="mt-2"
                                    required
                                />
                            </div>
                        </div>
                        {/* ROW 2 */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label>Số điện thoại</Label>
                                <Input
                                    placeholder="090..."
                                    value={form.soDienThoai}
                                    onChange={(e) =>
                                        setForm({ ...form, soDienThoai: e.target.value })
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* ROLE */}
                        <div>
                            <Label className="font-semibold">
                                Vai trò hệ thống
                            </Label>
                            <Select
                                value={form.vaiTro}
                                onValueChange={(v) =>
                                    setForm({ ...form, vaiTro: v })
                                }
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                    className="bg-white shadow-lg border border-gray-100 z-50">
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



                        {/* PASSWORD */}
                        <div>

                            <Label className="font-semibold">
                                Mật khẩu tạm thời
                            </Label>
                            <Input
                                type="password"
                                value={form.matKhau}
                                onChange={(e) =>
                                    setForm({ ...form, matKhau: e.target.value })
                                }
                                className="mt-2"
                                required
                            />
                        </div>
                        {/* ACTION */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/users")}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
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