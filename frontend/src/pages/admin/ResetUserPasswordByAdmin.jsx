import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ResetUserPasswordByAdmin() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [loadingUser, setLoadingUser] = useState(true);

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
                newPassword: password
            });

            toast.success("Reset mật khẩu thành công");
            navigate("/users");
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

                setUsername(result.data.tenDangNhap);

            } catch {

                toast.error("Không lấy được thông tin người dùng");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);


    return (
        <div className="lux-sync warehouse-unified gold-text-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="w-full max-w-3xl mx-auto space-y-6">
                <div className="rounded-2xl border border-[rgba(184,134,11,0.18)] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1a1612]">Cấp lại mật khẩu</h1>
                            <p className="mt-1 text-sm text-[#7a6e5f]">
                                Đặt mật khẩu mới cho người dùng <span className="font-semibold">{loadingUser ? "..." : username}</span>
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-[rgba(184,134,11,0.28)] text-[#7a6e5f] hover:bg-[rgba(184,134,11,0.08)] hover:text-[#b8860b]"
                            onClick={() => navigate("/users")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                    </div>
                </div>

                <Card className="border border-[rgba(184,134,11,0.16)] shadow-sm bg-white overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent" />
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-[rgba(184,134,11,0.1)] text-[#b8860b] rounded-full">
                                <KeyRound className="w-5 h-5" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[#7a6e5f] font-medium">Mật khẩu mới</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    className="border-[rgba(184,134,11,0.2)] focus-visible:ring-[rgba(184,134,11,0.25)]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#7a6e5f] font-medium">Xác nhận mật khẩu</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className="border-[rgba(184,134,11,0.2)] focus-visible:ring-[rgba(184,134,11,0.25)]"
                                />
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[rgba(184,134,11,0.28)] text-[#7a6e5f] hover:bg-[rgba(184,134,11,0.08)] hover:text-[#b8860b]"
                                    onClick={() => navigate("/users")}
                                >
                                    Hủy thao tác
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"
                                >
                                    {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}