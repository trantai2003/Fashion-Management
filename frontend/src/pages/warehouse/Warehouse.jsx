import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { khoService } from '@/services/khoService';
import { useToggle } from '@/hooks/useToggle';
import ConfirmModal from '@/components/ui/confirm-modal';
import {
    WarehouseHeader,
    WarehouseStats,
    WarehouseSearchFilter,
    WarehouseList,
    WarehouseEmptyState,
    WarehouseDialog
} from '.';

export default function WarehouseManagement() {
    const [warehouses, setWarehouses] = useState([]);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingManagers, setIsLoadingManagers] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
    });
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // create, edit, view
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isConfirmOpen, openConfirm, closeConfirm] = useToggle(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        maKho: '',
        tenKho: '',
        diaChi: '',
        quanLyId: '',
        trangThai: 1
    });

    const [errors, setErrors] = useState({});

    // Fetch warehouses
    const fetchWarehouses = useCallback(async (page = pagination.pageNumber, size = pagination.pageSize) => {
        try {
            setIsLoading(true);
            const payload = buildWarehouseFilterPayload({ searchTerm, filterStatus, pageNumber: page, pageSize: size });
            const res = await khoService.filter(payload);

            console.log(res);

            if (res?.data?.data) {
                setWarehouses(res.data.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    pageNumber: res.data.data.number || 0,
                    pageSize: Math.max(res.data.data.size, 1),
                    totalElements: res.data.data.totalElements || 0,
                    totalPages: res.data.data.totalPages || 0,
                }));
            } else if (res?.data) {
                setWarehouses(res.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    pageNumber: res.data.number || 0,
                    pageSize: Math.max(res.data.size, 1),
                    totalElements: res.data.totalElements || 0,
                    totalPages: res.data.totalPages || 0,
                }));
            } else {
                setWarehouses([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách kho:", error);
            toast.error("Không thể tải danh sách kho");
            setWarehouses([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterStatus, pagination.pageNumber, pagination.pageSize]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({...prev, pageNumber: newPage}));
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({...prev, pageSize: newSize, pageNumber: 0}));
    };

    // Fetch managers
    const fetchManagers = useCallback(async () => {
        try {
            setIsLoadingManagers(true);
            const res = await khoService.getManagers();
            if (res.data?.status === 200) {
                const pageData = res.data.data;
                const users = pageData.content || [];
                setManagers(users.map(u => ({ id: u.id, name: u.hoTen })));
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách quản lý:", error);
            toast.error("Không thể tải danh sách người quản lý");
        } finally {
            setIsLoadingManagers(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    useEffect(() => {
        if (showDialog) {
            fetchManagers();
        }
    }, [showDialog, fetchManagers]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.maKho) {
            newErrors.maKho = 'Vui lòng nhập mã kho';
        }

        if (!formData.tenKho) {
            newErrors.tenKho = 'Vui lòng nhập tên kho';
        } else if (formData.tenKho.length < 5) {
            newErrors.tenKho = 'Tên kho phải có ít nhất 5 ký tự';
        }

        if (!formData.diaChi) {
            newErrors.diaChi = 'Vui lòng nhập địa chỉ';
        }

        if (!formData.quanLyId) {
            newErrors.quanLyId = 'Vui lòng chọn người quản lý';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function buildWarehouseFilterPayload(filters) {
        const filterList = [];

        if (filters.searchTerm?.trim()) {
            ["tenKho", "maKho", "diaChi"].forEach((field) => {
                filterList.push({
                    fieldName: field,
                    operation: "ILIKE",
                    value: filters.searchTerm.trim(),
                    logicType: "OR",
                });
            });
        }

        if (filters.filterStatus === "active") {
            filterList.push({
                fieldName: "trangThai",
                operation: "EQUALS",
                value: 1,
                logicType: "AND",
            });
        } else if (filters.filterStatus === "inactive") {
            filterList.push({
                fieldName: "trangThai",
                operation: "EQUALS",
                value: 0,
                logicType: "AND",
            });
        }

        return {
            filters: filterList,
            sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
            page: filters.pageNumber,
            size: filters.pageSize,
        };
    }

    const handleOpenDialog = (mode, warehouse = null) => {
        setDialogMode(mode);
        setSelectedWarehouse(warehouse);

        if (mode === 'create') {
            setFormData({
                maKho: '',
                tenKho: '',
                diaChi: '',
                quanLyId: '',
                trangThai: 1
            });
        } else if (mode === 'edit' && warehouse) {
            setFormData({
                maKho: warehouse.maKho,
                tenKho: warehouse.tenKho,
                diaChi: warehouse.diaChi,
                quanLyId: warehouse.quanLy?.id?.toString() || '',
                trangThai: warehouse.trangThai ?? 1
            });
        } else if (mode === 'view' && warehouse) {
            setSelectedWarehouse(warehouse);
        }

        setErrors({});
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setSelectedWarehouse(null);
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const warehouseData = {
                maKho: formData.maKho,
                tenKho: formData.tenKho,
                diaChi: formData.diaChi,
                quanLyId: Number(formData.quanLyId),
                trangThai: Number(formData.trangThai)
            };

            console.log('Sending warehouse data:', warehouseData);

            let res;
            if (dialogMode === 'create') {
                res = await khoService.create(warehouseData);
            } else if (dialogMode === 'edit') {
                const updateData = {
                    id: selectedWarehouse.id,
                    ...warehouseData
                };
                res = await khoService.update(updateData);
            }

            // Check if backend returns error in response body (HTTP 200 with data.status = 400)
            if (res?.data?.status >= 400) {
                toast.error(res.data.message || 'Có lỗi xảy ra');
                return;
            }

            // Success
            toast.success(dialogMode === 'create' ? 'Thêm kho mới thành công!' : 'Cập nhật thông tin kho thành công!');
            setShowDialog(false);
            setErrors({});
            fetchWarehouses();
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);

            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý kho';
            toast.error(errorMessage);
        }
    };

    const handleDeleteClick = useCallback((warehouse) => {
        setWarehouseToDelete(warehouse);
        openConfirm();
    }, [openConfirm]);

    const handleConfirmDelete = useCallback(async () => {
        if (!warehouseToDelete) return;

        try {
            setIsDeleting(true);
            await khoService.delete(warehouseToDelete.id);
            toast.success('Xóa kho thành công!');
            closeConfirm();
            setWarehouseToDelete(null);
            fetchWarehouses();
        } catch (error) {
            console.error('Lỗi khi xóa kho:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa kho');
        } finally {
            setIsDeleting(false);
        }
    }, [warehouseToDelete, closeConfirm, fetchWarehouses]);

    const handleCancelDelete = useCallback(() => {
        if (!isDeleting) {
            setWarehouseToDelete(null);
            closeConfirm();
        }
    }, [isDeleting, closeConfirm]);

    const stats = {
        total: warehouses.length,
        active: warehouses.filter(w => w.trangThai === 1).length,
        inactive: warehouses.filter(w => w.trangThai === 0).length,
        totalStock: warehouses.reduce((sum, w) => sum + (w.soLuongTon || 0), 0)
    };

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">
                <WarehouseHeader onAddWarehouse={() => handleOpenDialog('create')} />
                <WarehouseStats stats={stats} />
                <WarehouseSearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Đang tải danh sách kho...</span>
                    </div>
                ) : warehouses.length > 0 ? (
                    <>
                        <WarehouseList
                            warehouses={warehouses}
                            onView={(warehouse) => handleOpenDialog('view', warehouse)}
                            onEdit={(warehouse) => handleOpenDialog('edit', warehouse)}
                            onDelete={handleDeleteClick}
                        />

                        {/* Pagination Section */}
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Left side - Page size selector */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                                    {pagination.pageSize} dòng
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                {[5, 10, 20, 50, 100].map(size => (
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

                                    {/* Center - Page info */}
                                    <div className="text-sm text-gray-600">
                                        Hiển thị{' '}
                                        <span className="font-semibold text-gray-900">
                                            {pagination.pageNumber * pagination.pageSize + 1}
                                        </span>
                                        {' '}-{' '}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                                        </span>
                                        {' '}trong tổng số{' '}
                                        <span className="font-semibold text-purple-600">{pagination.totalElements}</span> kết quả
                                    </div>

                                    {/* Right side - Navigation buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                            disabled={pagination.pageNumber === 0}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Trước
                                        </Button>

                                        {/* Page numbers */}
                                        <div className="hidden sm:flex gap-1">
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = idx;
                                                } else if (pagination.pageNumber < 3) {
                                                    pageNum = idx;
                                                } else if (pagination.pageNumber > pagination.totalPages - 4) {
                                                    pageNum = pagination.totalPages - 5 + idx;
                                                } else {
                                                    pageNum = pagination.pageNumber - 2 + idx;
                                                }

                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant={pagination.pageNumber === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={
                                                            pagination.pageNumber === pageNum
                                                                ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                                                                : "border-gray-200"
                                                        }
                                                    >
                                                        {pageNum + 1}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                            disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            Sau
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <WarehouseEmptyState />
                )}

                {/* Dialog for Create/Edit/View */}
                <WarehouseDialog
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    dialogMode={dialogMode}
                    selectedWarehouse={selectedWarehouse}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    managers={managers}
                    isLoadingManagers={isLoadingManagers}
                    onSubmit={handleSubmit}
                    onClose={handleCloseDialog}
                />

                {/* Confirm Delete Modal */}
                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận xóa kho"
                    description={
                        warehouseToDelete
                            ? `Bạn có chắc chắn muốn xóa kho "${warehouseToDelete.tenKho}"? Hành động này không thể hoàn tác.`
                            : "Bạn có chắc chắn muốn xóa kho này?"
                    }
                    confirmText="Xóa"
                    cancelText="Hủy"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}