import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
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
    const fetchWarehouses = useCallback(async () => {
        try {
            setIsLoading(true);
            const payload = buildWarehouseFilterPayload({ searchTerm, filterStatus });
            const res = await khoService.filter(payload);

            // doi 2 s
            
            console.log(res);

            if (res.data?.status === 200) {
                const pageData = res.data.data;
                setWarehouses(pageData.content || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách kho:", error);
            toast.error("Không thể tải danh sách kho");
            setWarehouses([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterStatus]);

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
            page: 0,
            size: 100,
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
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
                    <WarehouseList
                        warehouses={warehouses}
                        onView={(warehouse) => handleOpenDialog('view', warehouse)}
                        onEdit={(warehouse) => handleOpenDialog('edit', warehouse)}
                        onDelete={handleDeleteClick}
                    />
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