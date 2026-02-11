import { useState, useEffect, useCallback } from "react";
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
    MapPin
} from "lucide-react";

// Service xử lý API calls
const khachHangService = {
    filter: async (filterRequest) => {
        const response = await apiClient.post("/api/v1/khach-hang/filter", filterRequest);
        return response.data.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/api/v1/khach-hang/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post("/api/v1/khach-hang", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/api/v1/khach-hang/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/v1/khach-hang/${id}`);
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

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [loaiKhachHang, setLoaiKhachHang] = useState("all");
    const [trangThai, setTrangThai] = useState("all");
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Dialog states
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedKhachHang, setSelectedKhachHang] = useState(null);

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

    const handleViewDetail = async (khachHang) => {
        try {
            const detail = await khachHangService.getById(khachHang.id);
            setSelectedKhachHang(detail);
            setShowDetailDialog(true);
        } catch (error) {
            showAlert("Lỗi khi tải chi tiết khách hàng: " + error.message, "error");
        }
    };

    const handleDeleteClick = (khachHang) => {
        setSelectedKhachHang(khachHang);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await khachHangService.delete(selectedKhachHang.id);
            showAlert("Xóa khách hàng thành công");
            setShowDeleteDialog(false);
            loadKhachHangs();
        } catch (error) {
            showAlert("Lỗi khi xóa khách hàng: " + error.message, "error");
        }
    };

    // Render helpers
    const getTrangThaiBadge = (trangThai) => {
        const statusMap = {
            0: { label: "Hoạt động", variant: "success", icon: UserCheck },
            1: { label: "Ngưng hoạt động", variant: "destructive", icon: UserX }
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
                    <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">Quản lý khách hàng</CardTitle>
                        <Button className="bg-purple-600 hover:bg-purple-700">
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
                                            <SelectItem value="0">Hoạt động</SelectItem>
                                            <SelectItem value="1">Ngưng hoạt động</SelectItem>
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
                                                        onClick={() => handleViewDetail(khachHang)}
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-yellow-50 hover:text-yellow-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    
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

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-white text-gray-900 border border-gray-200 rounded-xl shadow-sm dark:bg-white dark:text-gray-900">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <User className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-gray-900">Chi tiết khách hàng</span>
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    {selectedKhachHang && (
                        <div className="space-y-6 py-4">
                            {/* Header Info */}
                            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                        Mã khách hàng
                                    </Label>
                                    <p className="text-2xl font-bold text-gray-900">{selectedKhachHang.maKhachHang}</p>
                                    <p className="text-lg text-gray-700">{selectedKhachHang.tenKhachHang}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {getTrangThaiBadge(selectedKhachHang.trangThai)}
                                    {getLoaiKhachHangBadge(selectedKhachHang.loaiKhachHang)}
                                </div>
                            </div>

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {selectedKhachHang.nguoiLienHe && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Người liên hệ
                                        </Label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{selectedKhachHang.nguoiLienHe}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedKhachHang.soDienThoai && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Số điện thoại
                                        </Label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{selectedKhachHang.soDienThoai}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedKhachHang.email && (
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Email
                                        </Label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{selectedKhachHang.email}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedKhachHang.diaChi && (
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Địa chỉ
                                        </Label>
                                        <div className="flex items-start gap-2 text-gray-900">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                            <span className="font-medium">{selectedKhachHang.diaChi}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Ngày tạo
                                        </Label>
                                        <p className="text-gray-900 font-medium">{formatDate(selectedKhachHang.ngayTao)}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Ngày cập nhật
                                        </Label>
                                        <p className="text-gray-900 font-medium">{formatDate(selectedKhachHang.ngayCapNhat)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="border-t border-gray-200 pt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowDetailDialog(false)}
                            className="w-full sm:w-auto bg-white hover:bg-gray-50"
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <p>Bạn có chắc chắn muốn xóa khách hàng <strong>{selectedKhachHang?.tenKhachHang}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Hủy
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}