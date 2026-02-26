import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaginationComponent from "../product/components/product/ProductComponent";
import apiClient from "@/services/apiClient";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    User,
    UserCheck,
    UserX,
    Filter,
    X,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

// Service xử lý API calls
const khachHangService = {
    filter: async (filterRequest) => {
        const response = await apiClient.post("/api/v1/khach-hang/filter", filterRequest);
        return response.data.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/api/v1/khach-hang/get-by-id/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post("/api/v1/khach-hang/create", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/api/v1/khach-hang/${id}`, data);
        return response.data;
    },

    softDelete: async (id) => {
        const response = await apiClient.delete(`/api/v1/khach-hang/soft-delete/${id}`);
        return response.data;
    }
};

// Component chính
export default function KhachHangPage() {
    const [khachHangs, setKhachHangs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [loaiKhachHang, setLoaiKhachHang] = useState("all");
    const [trangThai, setTrangThai] = useState("all");
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Dialog states
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedKhachHang, setSelectedKhachHang] = useState(null);

    // Form state for create
    const [formData, setFormData] = useState({
        maKhachHang: "",
        tenKhachHang: "",
        nguoiLienHe: "",
        soDienThoai: "",
        email: "",
        diaChi: "",
        loaiKhachHang: "le"
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Alert state
    const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

    // Load data
    const loadKhachHangs = useCallback(async () => {
        setLoading(true);
        try {
            const filters = [];

            // Search filter - tìm theo tên, mã, số điện thoại, email
            if (searchQuery.trim()) {
                filters.push({
                    fieldName: "tenKhachHang",
                    operation: "ILIKE",
                    value: `%${searchQuery}%`,
                    logicType: "OR"
                });
                filters.push({
                    fieldName: "maKhachHang",
                    operation: "ILIKE",
                    value: `%${searchQuery}%`,
                    logicType: "OR"
                });
                filters.push({
                    fieldName: "soDienThoai",
                    operation: "ILIKE",
                    value: `%${searchQuery}%`,
                    logicType: "OR"
                });
                filters.push({
                    fieldName: "email",
                    operation: "ILIKE",
                    value: `%${searchQuery}%`,
                    logicType: "OR"
                });
            }

            // Loại khách hàng filter
            if (loaiKhachHang !== "all") {
                filters.push({
                    fieldName: "loaiKhachHang",
                    operation: "EQUALS",
                    value: loaiKhachHang,
                    logicType: "AND"
                });
            }

            // Trạng thái filter
            if (trangThai !== "all") {
                filters.push({
                    fieldName: "trangThai",
                    operation: "EQUALS",
                    value: parseInt(trangThai),
                    logicType: "AND"
                });
            }

            const filterRequest = {
                filters,
                sorts: [
                    {
                        fieldName: "ngayTao",
                        direction: "DESC"
                    }
                ],
                page: currentPage,
                size: pageSize
            };

            const data = await khachHangService.filter(filterRequest);
            setKhachHangs(data.content || []);
            setTotalItems(data.totalElements || 0);
        } catch (error) {
            showAlert("Lỗi khi tải danh sách khách hàng: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, loaiKhachHang, trangThai]);

    useEffect(() => {
        loadKhachHangs();
    }, [loadKhachHangs]);

    // Alert helper
    const showAlert = (message, type = "success") => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
    };

    // Handlers
    const handleSearch = () => {
        setCurrentPage(0);
        loadKhachHangs();
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setLoaiKhachHang("all");
        setTrangThai("all");
        setCurrentPage(0);
    };

    const handleDeleteClick = (khachHang) => {
        setSelectedKhachHang(khachHang);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await khachHangService.softDelete(selectedKhachHang.id);
            showAlert("Xóa khách hàng thành công");
            setShowDeleteDialog(false);
            loadKhachHangs();
        } catch (error) {
            showAlert("Lỗi khi xóa khách hàng: " + error.message, "error");
        }
    };

    // Create dialog handlers
    const handleOpenCreateDialog = () => {
        setFormData({
            maKhachHang: "",
            tenKhachHang: "",
            nguoiLienHe: "",
            soDienThoai: "",
            email: "",
            diaChi: "",
            loaiKhachHang: "le"
        });
        setFormErrors({});
        setShowCreateDialog(true);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.maKhachHang.trim()) {
            errors.maKhachHang = "Mã khách hàng là bắt buộc";
        }

        if (!formData.tenKhachHang.trim()) {
            errors.tenKhachHang = "Tên khách hàng là bắt buộc";
        }

        if (formData.soDienThoai && !/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
            errors.soDienThoai = "Số điện thoại không hợp lệ (10-11 chữ số)";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Email không hợp lệ";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateSubmit = async () => {
        if (!validateForm()) {
            showAlert("Vui lòng kiểm tra lại thông tin", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await khachHangService.create(formData);
            showAlert("Thêm khách hàng thành công");
            setShowCreateDialog(false);
            loadKhachHangs();
        } catch (error) {
            showAlert("Lỗi khi thêm khách hàng: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render helpers
    const getTrangThaiBadge = (trangThai) => {
        const statusMap = {
            1: { label: "Hoạt động", variant: "success", icon: UserCheck },
            0: { label: "Ngưng hoạt động", variant: "red", icon: UserX }
        };

        const status = statusMap[trangThai] || statusMap[0];
        const Icon = status.icon;

        return (
            <Badge variant={status.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {status.label}
            </Badge>
        );
    };

    const getLoaiKhachHangLabel = (loaiKhachHang) => {
        const loaiMap = {
            "le": "Khách lẻ",
            "doanh_nghiep": "Doanh nghiệp",
            "si": "Khách sỉ"
        };
        return loaiMap[loaiKhachHang] || loaiKhachHang;
    };

    const getLoaiKhachHangBadge = (loaiKhachHang) => {
        const loaiMap = {
            "le": { label: "Khách lẻ", className: "bg-blue-100 text-blue-700 border-blue-200" },
            "doanh_nghiep": { label: "Doanh nghiệp", className: "bg-purple-100 text-purple-700 border-purple-200" },
            "si": { label: "Khách sỉ", className: "bg-green-100 text-green-700 border-green-200" }
        };

        const loai = loaiMap[loaiKhachHang] || { label: loaiKhachHang, className: "bg-gray-100 text-gray-700" };

        return (
            <Badge variant="outline" className={loai.className}>
                {loai.label}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Alert */}
            {alert.show && (
                <Alert className={alert.type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                    <div className="flex items-center gap-2">
                        {alert.type === "error" ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        <AlertDescription className={alert.type === "error" ? "text-red-800" : "text-green-800"}>
                            {alert.message}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">Quản lý khách hàng</CardTitle>
                        <Button
                            onClick={handleOpenCreateDialog}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm khách hàng
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Search bar */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm theo tên, mã, SĐT, email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                                Tìm kiếm
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                className={showFilterPanel ? "bg-purple-50 border-purple-300" : ""}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Bộ lọc
                            </Button>
                        </div>

                        {/* Advanced filters */}
                        {showFilterPanel && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Loại khách hàng</Label>
                                    <Select value={loaiKhachHang} onValueChange={setLoaiKhachHang}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="le">Khách lẻ</SelectItem>
                                            <SelectItem value="doanh_nghiep">Doanh nghiệp</SelectItem>
                                            <SelectItem value="si">Khách sỉ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Trạng thái</Label>
                                    <Select value={trangThai} onValueChange={setTrangThai}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="1">Hoạt động</SelectItem>
                                            <SelectItem value="0">Ngưng hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                                        <X className="w-4 h-4 mr-2" />
                                        Xóa bộ lọc
                                    </Button>
                                    <Button onClick={handleSearch} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        Áp dụng
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold">Mã KH</TableHead>
                                    <TableHead className="font-semibold">Tên khách hàng</TableHead>
                                    <TableHead className="font-semibold">Loại KH</TableHead>
                                    <TableHead className="font-semibold">Số điện thoại</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Đang tải dữ liệu...
                                        </TableCell>
                                    </TableRow>
                                ) : khachHangs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    khachHangs.map((khachHang) => (
                                        <TableRow key={khachHang.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{khachHang.maKhachHang}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{khachHang.tenKhachHang}</p>
                                                    {khachHang.nguoiLienHe && (
                                                        <p className="text-xs text-gray-500">NLH: {khachHang.nguoiLienHe}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getLoaiKhachHangBadge(khachHang.loaiKhachHang)}</TableCell>
                                            <TableCell>{khachHang.soDienThoai || "-"}</TableCell>
                                            <TableCell>{khachHang.email || "-"}</TableCell>
                                            <TableCell>{getTrangThaiBadge(khachHang.trangThai)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/customers/${khachHang.id}`)}
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    {/* <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-yellow-50 hover:text-yellow-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button> */}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(khachHang)}
                                                        className="hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <PaginationComponent
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(0);
                        }}
                        isLoading={loading}
                    />
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Plus className="w-5 h-5 text-purple-600" />
                            </div>
                            <DialogTitle className="text-xl text-gray-900">Thêm khách hàng mới</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Thông tin cơ bản */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-l-4 border-purple-600 pl-3">
                                Thông tin cơ bản
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maKhachHang" className="text-sm font-medium text-gray-700">
                                        Mã khách hàng <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="maKhachHang"
                                        value={formData.maKhachHang}
                                        onChange={(e) => handleFormChange("maKhachHang", e.target.value)}
                                        placeholder="VD: KH001"
                                        className={formErrors.maKhachHang ? "border-red-500" : ""}
                                    />
                                    {formErrors.maKhachHang && (
                                        <p className="text-xs text-red-500">{formErrors.maKhachHang}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tenKhachHang" className="text-sm font-medium text-gray-700">
                                        Tên khách hàng <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tenKhachHang"
                                        value={formData.tenKhachHang}
                                        onChange={(e) => handleFormChange("tenKhachHang", e.target.value)}
                                        placeholder="VD: Nguyễn Văn A"
                                        className={formErrors.tenKhachHang ? "border-red-500" : ""}
                                    />
                                    {formErrors.tenKhachHang && (
                                        <p className="text-xs text-red-500">{formErrors.tenKhachHang}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nguoiLienHe" className="text-sm font-medium text-gray-700">
                                        Người liên hệ
                                    </Label>
                                    <Input
                                        id="nguoiLienHe"
                                        value={formData.nguoiLienHe}
                                        onChange={(e) => handleFormChange("nguoiLienHe", e.target.value)}
                                        placeholder="VD: Trần Thị B"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="loaiKhachHang" className="text-sm font-medium text-gray-700">
                                        Loại khách hàng
                                    </Label>
                                    <Select
                                        value={formData.loaiKhachHang}
                                        onValueChange={(value) => handleFormChange("loaiKhachHang", value)}
                                    >
                                        <SelectTrigger id="loaiKhachHang">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="le">Khách lẻ</SelectItem>
                                            <SelectItem value="doanh_nghiep">Doanh nghiệp</SelectItem>
                                            <SelectItem value="si">Khách sỉ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin liên hệ */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-l-4 border-purple-600 pl-3">
                                Thông tin liên hệ
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="soDienThoai" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        Số điện thoại
                                    </Label>
                                    <Input
                                        id="soDienThoai"
                                        value={formData.soDienThoai}
                                        onChange={(e) => handleFormChange("soDienThoai", e.target.value)}
                                        placeholder="VD: 0123456789"
                                        className={formErrors.soDienThoai ? "border-red-500" : ""}
                                    />
                                    {formErrors.soDienThoai && (
                                        <p className="text-xs text-red-500">{formErrors.soDienThoai}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleFormChange("email", e.target.value)}
                                        placeholder="VD: example@email.com"
                                        className={formErrors.email ? "border-red-500" : ""}
                                    />
                                    {formErrors.email && (
                                        <p className="text-xs text-red-500">{formErrors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diaChi" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Địa chỉ
                                </Label>
                                <Input
                                    id="diaChi"
                                    value={formData.diaChi}
                                    onChange={(e) => handleFormChange("diaChi", e.target.value)}
                                    placeholder="VD: 123 Đường ABC, Quận XYZ, TP. HCM"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-gray-200 pt-4 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreateSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                            {isSubmitting ? "Đang xử lý..." : "Thêm khách hàng"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl text-gray-900">Xác nhận xóa</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-gray-700">
                            Bạn có chắc chắn muốn xóa khách hàng{" "}
                            <span className="font-semibold text-gray-900">{selectedKhachHang?.tenKhachHang}</span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Khách hàng sẽ được chuyển sang trạng thái "Ngưng hoạt động".
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}