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

            </div>


            {/* CARD */}
            <div className="flex justify-center">

                <Card className="w-full max-w-md border-0 shadow-md bg-white">

                    <CardContent className="p-8 space-y-6">
                        <div className="text-center">

                            <div className="flex justify-center mb-3">

                                <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 text-purple-600 rounded-full">

                                    <KeyRound className="w-6 h-6" />

                                </div>
                            </div>


                            <h2 className="text-xl font-bold text-gray-900">
                                Cấp lại mật khẩu
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Dành cho user{" "}
                                <span className="font-semibold italic">
                                    {loadingUser ? "..." : username}
                                </span>
                            </p>
                        </div>


                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="space-y-2">
                                <Label>Mật khẩu mới</Label>

                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>


                            <div className="space-y-2">
                                <Label>Xác nhận mật khẩu</Label>

                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>


                            {/* ACTION */}
                            <div className="pt-2 space-y-3">

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate("/users")}
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