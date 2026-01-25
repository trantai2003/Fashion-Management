import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function resetUserPasswordByAdmin() {
    const [username, setUsername] = useState("");
    const [loadingUser, setLoadingUser] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            await adminService.resetUserPasswordByAdmin(id, {
                newPassword: password,
            });

            toast.success("Reset mật khẩu thành công");
            navigate("/admin/users");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await adminService.getByIdByAdmin(id);
                // result = { status, data, message, error }
                setUsername(result.data.tenDangNhap);
            } catch (err) {
                toast.error("Không lấy được thông tin người dùng");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);


    return (
        <div className="flex flex-col h-full">
            {/* CONTENT */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                <Card className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <CardContent className="p-8 space-y-6">
                        <div className="text-center">
                            <div className="flex justify-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 text-purple-600 rounded-full mb-2">
                                    <KeyRound className="w-8 h-8" />
                                </div>
                            </div>


                            <h2 className="text-xl font-bold text-gray-900">
                                Cấp lại mật khẩu
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Dành cho user{" "}
                                <span className="font-semibold text-purple-600 italic">
                                    {loadingUser ? "..." : username}
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">
                                    Mật khẩu mới
                                </Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">
                                    Xác nhận mật khẩu
                                </Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                                >
                                    {loading ? "Đang Xử Lý..." : "Cập Nhật Mật Khẩu"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => navigate("/admin/users")}
                                >
                                    Hủy thao tác
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}