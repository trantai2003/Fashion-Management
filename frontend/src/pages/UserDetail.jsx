import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nguoiDungService } from "@/services/nguoiDungService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Mail,
    Phone,
    Save,
    Shield,
    User,
    X,
    AlertCircle,
    Activity,
} from "lucide-react";

export default function UserDetail() {
    const { id } = useParams(); // string
    const navigate = useNavigate();

    // UI state
    const [loadingUser, setLoadingUser] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [loadingActivities, setLoadingActivities] = useState(false);

    // User data
    const [userData, setUserData] = useState({
        id: null,
        tenDangNhap: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        vaiTro: "",
        trangThai: 0,
        ngayTao: "",
        ngayCapNhat: "",
    });

    const [editedData, setEditedData] = useState({ ...userData });

    // demo activities
    const [activities] = useState([
        { type: "success", title: "Cập nhật thông tin", detail: "Đổi email và số điện thoại", at: "2026-01-15T03:43:37Z" },
        { type: "info", title: "Đăng nhập hệ thống", detail: "Thiết bị: Chrome • IP: 192.168.1.100", at: "2026-01-14T10:12:00Z" },
    ]);

    const vaiTroOptions = useMemo(
        () => [
            { value: "quan_tri_vien", label: "Quản trị viên" },
            { value: "quan_ly_kho", label: "Quản lý kho" },
            { value: "nhan_vien_kho", label: "Nhân viên kho" },
            { value: "nhan_vien_ban_hang", label: "Nhân viên bán hàng" },
            { value: "nhan_vien_mua_hang", label: "Nhân viên mua hàng" },
            { value: "khach_hang", label: "Khách hàng" },
        ],
        []
    );

    const getVaiTroLabel = (value) => vaiTroOptions.find((opt) => opt.value === value)?.label || value || "—";
    const isActive = useMemo(() => Number(userData.trangThai) === 1, [userData.trangThai]);

    const initials = useMemo(() => {
        const name = userData.hoTen?.trim();
        if (!name) return "U";
        const parts = name.split(/\s+/).slice(0, 2);
        return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
    }, [userData.hoTen]);

    const formatDateTime = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString();
    };

    // ===== Fetch user =====
    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setErrorMsg("");
            setLoadingUser(true);

            try {
                const res = await nguoiDungService.getById(id);
                const dto = res?.data; // ResponseData.data
                if (!dto) throw new Error("Không nhận được data người dùng từ server");

                setUserData(dto);
                setEditedData(dto);
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "Lỗi tải dữ liệu người dùng";
                setErrorMsg(msg);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);

    // ===== Activities (demo) =====
    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            // TODO: cắm API real
        } finally {
            setLoadingActivities(false);
        }
    };

    // ===== Edit handlers =====
    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({ ...userData });
        setErrorMsg("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({ ...userData });
        setErrorMsg("");
    };

    const handleInputChange = (field, value) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    // ✅ build body theo UpdateNguoiDungRequest (id bắt buộc)
    const buildUpdatePayload = () => ({
        id: Number(userData.id), // hoặc Number(id)
        tenDangNhap: editedData.tenDangNhap?.trim(),
        hoTen: editedData.hoTen?.trim(),
        email: editedData.email?.trim(),
        soDienThoai: editedData.soDienThoai?.trim(),
    });

    const handleSave = async () => {
        if (!userData?.id) return;

        setSaving(true);
        setErrorMsg("");

        try {
            const payload = buildUpdatePayload();

            // validate FE nhẹ
            if (!payload.tenDangNhap) throw new Error("Tên đăng nhập không được để trống");
            if (!payload.hoTen) throw new Error("Họ tên không được để trống");

            const res = await nguoiDungService.updateUser(payload);
            const updatedDto = res?.data; // ResponseData.data
            if (!updatedDto) throw new Error("Cập nhật thành công nhưng response thiếu data");

            setUserData(updatedDto);
            setEditedData(updatedDto);
            setIsEditing(false);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Cập nhật thất bại";
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    // ===== UI helpers =====
    const activityIcon = (type) => {
        if (type === "success") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (type === "warning") return <AlertCircle className="w-4 h-4 text-amber-600" />;
        return <Activity className="w-4 h-4 text-blue-600" />;
    };

    const activityBg = (type) => {
        if (type === "success") return "bg-green-100";
        if (type === "warning") return "bg-amber-100";
        return "bg-blue-100";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button
                                onClick={handleEdit}
                                disabled={loadingUser}
                                className="bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                    <X className="w-4 h-4 mr-2" />
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {showSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Cập nhật thông tin người dùng thành công!
                        </AlertDescription>
                    </Alert>
                )}

                {errorMsg && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{errorMsg}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Summary */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="w-24 h-24 mb-4">
                                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-2xl">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <h3 className="text-xl font-bold text-gray-900">
                                        {loadingUser ? "Loading..." : userData.hoTen || "—"}
                                    </h3>

                                    <p className="text-gray-600 mb-2">@{userData.tenDangNhap || "—"}</p>

                                    <Badge className="mb-4" variant="outline">
                                        <Shield className="w-3 h-3 mr-1" />
                                        {getVaiTroLabel(userData.vaiTro)}
                                    </Badge>

                                    <div className="flex items-center gap-2 mb-6">
                                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                        <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-600"}`}>
                                            {isActive ? "Đang hoạt động" : "Không hoạt động"}
                                        </span>
                                    </div>

                                    <div className="w-full space-y-3 text-left border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Ngày tạo: {formatDateTime(userData.ngayTao)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>Cập nhật: {formatDateTime(userData.ngayCapNhat)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Thông tin hệ thống</CardTitle>
                                <CardDescription>Thông tin quan trọng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between">
                                    <span>ID</span>
                                    <span className="font-medium">{userData.id ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Vai trò</span>
                                    <span className="font-medium">{getVaiTroLabel(userData.vaiTro)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trạng thái</span>
                                    <span className="font-medium">{isActive ? "Hoạt động" : "Không hoạt động"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs
                            defaultValue="info"
                            className="space-y-4"
                            onValueChange={(v) => {
                                if (v === "activity") fetchActivities();
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="info">Thông tin</TabsTrigger>
                                <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                            </TabsList>

                            {/* Tab: Thông tin */}
                            <TabsContent value="info">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Thông tin người dùng</CardTitle>
                                        <CardDescription>
                                            {isEditing ? "Chỉnh sửa các trường cho phép cập nhật" : "Chế độ chỉ xem (read-only)"}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        {/* tenDangNhap */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tenDangNhap" className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                Tên đăng nhập
                                            </Label>
                                            <Input
                                                id="tenDangNhap"
                                                value={isEditing ? editedData.tenDangNhap : userData.tenDangNhap}
                                                onChange={(e) => handleInputChange("tenDangNhap", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing ? "bg-gray-50" : ""}
                                            />
                                        </div>

                                        {/* hoTen */}
                                        <div className="space-y-2">
                                            <Label htmlFor="hoTen">Họ và tên</Label>
                                            <Input
                                                id="hoTen"
                                                value={isEditing ? editedData.hoTen : userData.hoTen}
                                                onChange={(e) => handleInputChange("hoTen", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing ? "bg-gray-50" : ""}
                                            />
                                        </div>

                                        {/* email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={isEditing ? editedData.email : userData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing ? "bg-gray-50" : ""}
                                            />
                                        </div>

                                        {/* soDienThoai */}
                                        <div className="space-y-2">
                                            <Label htmlFor="soDienThoai" className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                Số điện thoại
                                            </Label>
                                            <Input
                                                id="soDienThoai"
                                                value={isEditing ? editedData.soDienThoai : userData.soDienThoai}
                                                onChange={(e) => handleInputChange("soDienThoai", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing ? "bg-gray-50" : ""}
                                            />
                                        </div>

                                        {/* read-only fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Vai trò</Label>
                                                <Input value={getVaiTroLabel(userData.vaiTro)} disabled className="bg-gray-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Trạng thái</Label>
                                                <Input value={isActive ? "Hoạt động" : "Không hoạt động"} disabled className="bg-gray-50" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Hoạt động */}
                            <TabsContent value="activity">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Lịch sử hoạt động</CardTitle>
                                        <CardDescription>Demo UI — cắm API sau</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {loadingActivities && <div className="text-sm text-gray-600">Đang tải hoạt động...</div>}

                                        {!loadingActivities &&
                                            activities.map((a, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className={`p-2 rounded-lg ${activityBg(a.type)}`}>{activityIcon(a.type)}</div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="font-medium text-gray-900">{a.title}</p>
                                                            <span className="text-xs text-gray-500">{formatDateTime(a.at)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">{a.detail}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
