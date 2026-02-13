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
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    X
} from "lucide-react";

const kho_id = window.location.pathname.split("/")[2]; // Lấy kho_id từ URL

// Service xử lý API calls
const phieuXuatKhoService = {
    filter: async (filterRequest) => {
        const response = await apiClient.post("/api/v1/phieu-xuat-kho/filter", filterRequest, {
            headers: {
                "kho_id": kho_id
            }
        });
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post("/api/v1/phieu-xuat-kho", data, {
            headers: {
                "kho_id": kho_id
            }
        });
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/api/v1/phieu-xuat-kho/${id}`, data, {
            headers: {
                "kho_id": kho_id
            }
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/v1/phieu-xuat-kho/${id}`, {
            headers: {
                "kho_id": kho_id
            }
        });
        return response.data;
    },

    duyet: async (id) => {
        const response = await apiClient.post(`/api/v1/phieu-xuat-kho/${id}/duyet`, {}, {
            headers: {
                "kho_id": kho_id
            }
        });
        return response.data;
    }
};

// Component chính
export default function PhieuXuatKhoPage() {
    const [phieuXuatKhos, setPhieuXuatKhos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [loaiXuat, setLoaiXuat] = useState("all");
    const [trangThai, setTrangThai] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Dialog states
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);

    // Alert state
    const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

    // Load data
    const loadPhieuXuatKhos = useCallback(async () => {
        setLoading(true);
        try {
            const filters = [];
            
            // Search filter
            if (searchQuery.trim()) {
                filters.push({
                    fieldName: "soPhieuXuat",
                    operation: "ILIKE",
                    value: `%${searchQuery}%`,
                    logicType: "AND"
                });
            }

            // Loại xuất filter
            if (loaiXuat !== "all") {
                filters.push({
                    fieldName: "loaiXuat",
                    operation: "EQUALS",
                    value: loaiXuat,
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

            // Date range filter
            if (fromDate) {
                filters.push({
                    fieldName: "ngayXuat",
                    operation: "GREATER_THAN_OR_EQUAL",
                    value: new Date(fromDate).toISOString(),
                    logicType: "AND"
                });
            }

            if (toDate) {
                filters.push({
                    fieldName: "ngayXuat",
                    operation: "LESS_THAN_OR_EQUAL",
                    value: new Date(toDate).toISOString(),
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

            const data = await phieuXuatKhoService.filter(filterRequest);
            setPhieuXuatKhos(data.content || []);
            setTotalItems(data.totalElements || 0);
        } catch (error) {
            showAlert("Lỗi khi tải danh sách phiếu xuất kho: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, loaiXuat, trangThai, fromDate, toDate]);

    useEffect(() => {
        loadPhieuXuatKhos();
    }, [loadPhieuXuatKhos]);

    // Alert helper
    const showAlert = (message, type = "success") => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
    };

    // Handlers
    const handleSearch = () => {
        setCurrentPage(0);
        loadPhieuXuatKhos();
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setLoaiXuat("all");
        setTrangThai("all");
        setFromDate("");
        setToDate("");
        setCurrentPage(0);
    };

    const handleViewDetail = (phieu) => {
        setSelectedPhieu(phieu);
        setShowDetailDialog(true);
    };

    const handleDeleteClick = (phieu) => {
        setSelectedPhieu(phieu);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await phieuXuatKhoService.delete(selectedPhieu.id);
            showAlert("Xóa phiếu xuất kho thành công");
            setShowDeleteDialog(false);
            loadPhieuXuatKhos();
        } catch (error) {
            showAlert("Lỗi khi xóa phiếu xuất: " + error.message, "error");
        }
    };

    const handleDuyet = async (id) => {
        try {
            await phieuXuatKhoService.duyet(id);
            showAlert("Duyệt phiếu xuất kho thành công");
            loadPhieuXuatKhos();
        } catch (error) {
            showAlert("Lỗi khi duyệt phiếu xuất: " + error.message, "error");
        }
    };

    // Render helpers
    const getTrangThaiBadge = (trangThai) => {
        const statusMap = {
            0: { label: "Chờ duyệt", variant: "secondary", icon: Clock },
            1: { label: "Đã duyệt", variant: "success", icon: CheckCircle },
            2: { label: "Đã hủy", variant: "destructive", icon: XCircle }
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

    const getLoaiXuatLabel = (loaiXuat) => {
        const loaiMap = {
            "ban_hang": "Bán hàng",
            "chuyen_kho": "Chuyển kho",
            "huy_hang": "Hủy hàng",
            "khac": "Khác"
        };
        return loaiMap[loaiXuat] || loaiXuat;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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
                        <CardTitle className="text-2xl font-bold">Quản lý phiếu xuất kho</CardTitle>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo phiếu xuất
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
                                    placeholder="Tìm kiếm theo số phiếu xuất..."
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Loại xuất</Label>
                                    <Select value={loaiXuat} onValueChange={setLoaiXuat}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="ban_hang">Bán hàng</SelectItem>
                                            <SelectItem value="chuyen_kho">Chuyển kho</SelectItem>
                                            <SelectItem value="huy_hang">Hủy hàng</SelectItem>
                                            <SelectItem value="khac">Khác</SelectItem>
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
                                            <SelectItem value="0">Chờ duyệt</SelectItem>
                                            <SelectItem value="1">Đã duyệt</SelectItem>
                                            <SelectItem value="2">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Từ ngày</Label>
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Đến ngày</Label>
                                    <Input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-span-full flex justify-end gap-2">
                                    <Button variant="outline" onClick={handleResetFilters}>
                                        <X className="w-4 h-4 mr-2" />
                                        Xóa bộ lọc
                                    </Button>
                                    <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
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
                                    <TableHead className="font-semibold">Số phiếu</TableHead>
                                    <TableHead className="font-semibold">Ngày xuất</TableHead>
                                    <TableHead className="font-semibold">Loại xuất</TableHead>
                                    <TableHead className="font-semibold">Người xuất</TableHead>
                                    <TableHead className="font-semibold">Người duyệt</TableHead>
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
                                ) : phieuXuatKhos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    phieuXuatKhos.map((phieu) => (
                                        <TableRow key={phieu.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{phieu.soPhieuXuat}</TableCell>
                                            <TableCell>{formatDate(phieu.ngayXuat)}</TableCell>
                                            <TableCell>{getLoaiXuatLabel(phieu.loaiXuat)}</TableCell>
                                            <TableCell>{phieu.nguoiXuat?.hoTen || "-"}</TableCell>
                                            <TableCell>{phieu.nguoiDuyet?.hoTen || "-"}</TableCell>
                                            <TableCell>{getTrangThaiBadge(phieu.trangThai)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetail(phieu)}
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    {phieu.trangThai === 0 && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDuyet(phieu.id)}
                                                                className="hover:bg-green-50 hover:text-green-600"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-yellow-50 hover:text-yellow-600"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(phieu)}
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
                <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-gray-900">Chi tiết phiếu xuất kho</span>
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    {selectedPhieu && (
                        <div className="space-y-6 py-4">
                            {/* Header Info */}
                            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                        Số phiếu xuất
                                    </Label>
                                    <p className="text-2xl font-bold text-gray-900">{selectedPhieu.soPhieuXuat}</p>
                                </div>
                                <div>
                                    {getTrangThaiBadge(selectedPhieu.trangThai)}
                                </div>
                            </div>

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Ngày xuất
                                    </Label>
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{formatDate(selectedPhieu.ngayXuat)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Loại xuất
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-medium bg-white">
                                            {getLoaiXuatLabel(selectedPhieu.loaiXuat)}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Người xuất
                                    </Label>
                                    <p className="text-gray-900 font-medium">{selectedPhieu.nguoiXuat?.hoTen || "-"}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Người duyệt
                                    </Label>
                                    <p className="text-gray-900 font-medium">{selectedPhieu.nguoiDuyet?.hoTen || "-"}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(selectedPhieu.khoChuyenDen || selectedPhieu.ghiChu) && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    {selectedPhieu.khoChuyenDen && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Kho chuyển đến
                                            </Label>
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-gray-900 font-medium">{selectedPhieu.khoChuyenDen.tenKho}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPhieu.ghiChu && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Ghi chú
                                            </Label>
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <p className="text-gray-700 text-sm leading-relaxed">{selectedPhieu.ghiChu}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                    <p>Bạn có chắc chắn muốn xóa phiếu xuất <strong>{selectedPhieu?.soPhieuXuat}</strong>?</p>
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