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
    CheckCircle2,
    RefreshCcw,
    Loader2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    Users,
    UserPlus,
    Building2,
    Store
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            "doanh_nghiep": { label: "Doanh nghiệp", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            "si": { label: "Khách sỉ", className: "bg-green-100 text-green-700 border-green-200" }
        };

        const loai = loaiMap[loaiKhachHang] || { label: loaiKhachHang, className: "bg-gray-100 text-gray-700" };

        return (
            <Badge variant="outline" className={loai.className}>
                {loai.label}
            </Badge>
        );
    };

    const stats = {
        total: totalItems,
        le: khachHangs.filter(k => k.loaiKhachHang === "le").length,
        si: khachHangs.filter(k => k.loaiKhachHang === "si").length,
        doanh_nghiep: khachHangs.filter(k => k.loaiKhachHang === "doanh_nghiep").length
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < Math.ceil(totalItems / pageSize)) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 min-h-screen" style={{background: "linear-gradient(135deg, #ca8a04 0%, #b45309 100%)"}}>
            <div className="space-y-6 w-full">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/95 ring-1 ring-white/60">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tổng khách hàng</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/95 ring-1 ring-white/60">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Khách lẻ</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.le}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/95 ring-1 ring-white/60">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Khách sỉ</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.si}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Store className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/95 ring-1 ring-white/60">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Doanh nghiệp</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.doanh_nghiep}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <Card className="border-0 shadow-lg bg-white/95 ring-1 ring-white/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-yellow-600" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search bar */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo tên, mã, SĐT, email..."
                                        className="pl-9 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                </div>
                            </div>

                            {/* Loại khách hàng */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Loại khách hàng</Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                            <span className="truncate">
                                                {loaiKhachHang === "all" && "Tất cả loại"}
                                                {loaiKhachHang === "le" && "Khách lẻ"}
                                                {loaiKhachHang === "si" && "Khách sỉ"}
                                                {loaiKhachHang === "doanh_nghiep" && "Doanh nghiệp"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        <DropdownMenuItem onClick={() => setLoaiKhachHang("all")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Tất cả loại {loaiKhachHang === "all" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLoaiKhachHang("le")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Khách lẻ {loaiKhachHang === "le" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLoaiKhachHang("si")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Khách sỉ {loaiKhachHang === "si" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLoaiKhachHang("doanh_nghiep")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Doanh nghiệp {loaiKhachHang === "doanh_nghiep" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Trạng thái */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                            <span className="truncate">
                                                {trangThai === "all" && "Tất cả trạng thái"}
                                                {trangThai === "1" && "Hoạt động"}
                                                {trangThai === "0" && "Ngưng hoạt động"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        <DropdownMenuItem onClick={() => setTrangThai("all")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Tất cả trạng thái {trangThai === "all" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTrangThai("1")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Hoạt động {trangThai === "1" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTrangThai("0")} className="flex items-center justify-between cursor-pointer hover:bg-yellow-50">
                                            Ngưng hoạt động {trangThai === "0" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Reset Button */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={handleResetFilters}
                                    className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 h-10 px-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full justify-center"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleOpenCreateDialog}
                        className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm gap-2 transition-all duration-200"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm khách hàng
                    </Button>
                </div>

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

                {/* Table Section */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase w-14">STT</th>
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mã KH</th>
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Khách hàng</th>
                                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Loại KH</th>
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Liên hệ</th>
                                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Trạng thái</th>
                                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-500">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
                                                Đang tải dữ liệu...
                                            </div>
                                        </td>
                                    </tr>
                                ) : khachHangs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-500">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    khachHangs.map((khachHang, index) => (
                                        <tr key={khachHang.id} className="transition-colors duration-150 hover:bg-yellow-50/50">
                                            <td className="px-4 py-3.5 align-middle text-center text-slate-500 text-xs">
                                                {currentPage * pageSize + index + 1}
                                            </td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <span className="font-bold text-yellow-600 tracking-wide">{khachHang.maKhachHang}</span>
                                            </td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="font-semibold text-slate-900">{khachHang.tenKhachHang}</div>
                                                {khachHang.nguoiLienHe && (
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {khachHang.nguoiLienHe}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 align-middle text-center">
                                                {getLoaiKhachHangBadge(khachHang.loaiKhachHang)}
                                            </td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex flex-col gap-1 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {khachHang.soDienThoai || "-"}</div>
                                                    <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {khachHang.email || "-"}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 align-middle text-center">
                                                {khachHang.trangThai === 1 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        Ngừng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => navigate(`/customers/${khachHang.id}`)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(khachHang)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-red-500 hover:bg-red-50 hover:border-red-200"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Section */}
                <Card className="border-0 shadow-md bg-white">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                            {pageSize} dòng
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                        {[20, 50, 100].map(size => (
                                            <DropdownMenuItem
                                                key={size}
                                                onClick={() => handlePageSizeChange(size)}
                                                className="cursor-pointer"
                                            >
                                                {size} dòng
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="text-sm text-gray-600">
                                Hiển thị{' '}
                                <span className="font-semibold text-gray-900">
                                    {currentPage * pageSize + 1}
                                </span>
                                {' '}-{' '}
                                <span className="font-semibold text-gray-900">
                                    {Math.min((currentPage + 1) * pageSize, totalItems)}
                                </span>
                                {' '}trong tổng số{' '}
                                <span className="font-semibold text-yellow-600">{totalItems}</span> kết quả
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="gap-1 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Trước
                                </Button>

                                <div className="hidden sm:flex gap-1">
                                    {[...Array(Math.min(5, Math.ceil(totalItems / pageSize)))].map((_, idx) => (
                                        <Button
                                            key={idx}
                                            variant={currentPage === idx ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(idx)}
                                            className={
                                                currentPage === idx
                                                    ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                                                    : "border-gray-200"
                                            }
                                        >
                                            {idx + 1}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil(totalItems / pageSize) - 1}
                                    className="gap-1 disabled:opacity-50"
                                >
                                    Sau
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
<Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) setShowCreateDialog(false); }}>
    <DialogContent
        className="w-[95vw] max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden"
        style={{ background: "#faf7f0", color: "#0f172a", outline: "none" }}
    >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ background: "#faf7f0" }}>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: "#0f172a" }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0" style={{ background: "#fef9c3" }}>
                        <UserPlus className="w-4 h-4" style={{ color: "#ca8a04" }} />
                    </div>
                    Thêm khách hàng mới
                </DialogTitle>
                <p className="text-sm mt-1 ml-10" style={{ color: "#64748b" }}>
                    Điền thông tin để tạo khách hàng mới
                </p>
            </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 overflow-y-auto max-h-[65vh]" style={{ background: "#faf7f0" }}>
            <div className="space-y-5">

                {/* Thông tin cơ bản */}
                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ca8a04" }}>
                        Thông tin cơ bản
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Mã khách hàng */}
                        <div className="space-y-1.5">
                            <Label htmlFor="maKhachHang" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                Mã khách hàng *
                            </Label>
                            <Input
                                id="maKhachHang"
                                placeholder="VD: KH001"
                                value={formData.maKhachHang}
                                onChange={(e) => handleFormChange("maKhachHang", e.target.value)}
                                style={{ background: "#ffffff", borderColor: formErrors.maKhachHang ? "#ef4444" : "#e5e7eb", color: "#0f172a" }}
                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                            />
                            {formErrors.maKhachHang && (
                                <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                    <AlertCircle className="w-3 h-3" />{formErrors.maKhachHang}
                                </p>
                            )}
                        </div>

                        {/* Tên khách hàng */}
                        <div className="space-y-1.5">
                            <Label htmlFor="tenKhachHang" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                Tên khách hàng *
                            </Label>
                            <Input
                                id="tenKhachHang"
                                placeholder="VD: Nguyễn Văn A"
                                value={formData.tenKhachHang}
                                onChange={(e) => handleFormChange("tenKhachHang", e.target.value)}
                                style={{ background: "#ffffff", borderColor: formErrors.tenKhachHang ? "#ef4444" : "#e5e7eb", color: "#0f172a" }}
                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                            />
                            {formErrors.tenKhachHang && (
                                <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                    <AlertCircle className="w-3 h-3" />{formErrors.tenKhachHang}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Người liên hệ */}
                        <div className="space-y-1.5">
                            <Label htmlFor="nguoiLienHe" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                Người liên hệ
                            </Label>
                            <Input
                                id="nguoiLienHe"
                                placeholder="VD: Trần Thị B"
                                value={formData.nguoiLienHe}
                                onChange={(e) => handleFormChange("nguoiLienHe", e.target.value)}
                                style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0f172a" }}
                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                            />
                        </div>

                        {/* Loại khách hàng */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                Loại khách hàng
                            </Label>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="h-10 w-full rounded-md px-3 text-left text-sm flex items-center justify-between transition-colors duration-150"
                                        style={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#0f172a" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#faf7f0"}
                                        onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                                    >
                                        <span>
                                            {formData.loaiKhachHang === "le" && "Khách lẻ"}
                                            {formData.loaiKhachHang === "si" && "Khách sỉ"}
                                            {formData.loaiKhachHang === "doanh_nghiep" && "Doanh nghiệp"}
                                        </span>
                                        <ChevronDown className="h-4 w-4" style={{ color: "#9ca3af" }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-[--radix-dropdown-menu-trigger-width] rounded-xl shadow-xl border"
                                    style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
                                >
                                    {[
                                        { value: "le", label: "Khách lẻ" },
                                        { value: "si", label: "Khách sỉ" },
                                        { value: "doanh_nghiep", label: "Doanh nghiệp" },
                                    ].map(opt => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => handleFormChange("loaiKhachHang", opt.value)}
                                            className="flex items-center justify-between cursor-pointer"
                                            style={{ color: "#0f172a" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fef9c3"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            {opt.label}
                                            {formData.loaiKhachHang === opt.value && <Check className="h-4 w-4" style={{ color: "#ca8a04" }} />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid #ede8db" }} />

                {/* Thông tin liên hệ */}
                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ca8a04" }}>
                        Thông tin liên hệ
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Số điện thoại */}
                        <div className="space-y-1.5">
                            <Label htmlFor="soDienThoai" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                <Phone className="w-3.5 h-3.5" /> Số điện thoại
                            </Label>
                            <Input
                                id="soDienThoai"
                                placeholder="VD: 0123456789"
                                value={formData.soDienThoai}
                                onChange={(e) => handleFormChange("soDienThoai", e.target.value)}
                                style={{ background: "#ffffff", borderColor: formErrors.soDienThoai ? "#ef4444" : "#e5e7eb", color: "#0f172a" }}
                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                            />
                            {formErrors.soDienThoai && (
                                <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                    <AlertCircle className="w-3 h-3" />{formErrors.soDienThoai}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                <Mail className="w-3.5 h-3.5" /> Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="VD: example@email.com"
                                value={formData.email}
                                onChange={(e) => handleFormChange("email", e.target.value)}
                                style={{ background: "#ffffff", borderColor: formErrors.email ? "#ef4444" : "#e5e7eb", color: "#0f172a" }}
                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                            />
                            {formErrors.email && (
                                <p className="text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                    <AlertCircle className="w-3 h-3" />{formErrors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    <div className="space-y-1.5">
                        <Label htmlFor="diaChi" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                            <MapPin className="w-3.5 h-3.5" /> Địa chỉ
                        </Label>
                        <Input
                            id="diaChi"
                            placeholder="VD: 123 Đường ABC, Quận XYZ, TP. HCM"
                            value={formData.diaChi}
                            onChange={(e) => handleFormChange("diaChi", e.target.value)}
                            style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0f172a" }}
                            className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                        />
                    </div>
                </div>

            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4" style={{ background: "#f5efe0", borderTop: "1px solid #ede8db" }}>
            <button
                type="button"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                onMouseEnter={e => e.currentTarget.style.background = "#faf7f0"}
                onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                onClick={() => setShowCreateDialog(false)}
            >
                Hủy
            </button>
            <button
                type="button"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-150 disabled:opacity-50"
                style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = "#ca8a04"; }}
                onMouseLeave={e => e.currentTarget.style.background = "#eab308"}
                onClick={handleCreateSubmit}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4" />
                        Thêm khách hàng
                    </>
                )}
            </button>
        </div>
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