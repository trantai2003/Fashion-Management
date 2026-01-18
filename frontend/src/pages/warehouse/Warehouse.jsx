import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';
import {
    WarehouseHeader,
    WarehouseStats,
    WarehouseSearchFilter,
    WarehouseList,
    WarehouseEmptyState,
    WarehouseDialog
} from '.';

export default function WarehouseManagement() {
    const [warehouses, setWarehouses] = useState([
        {
            id: 1,
            maKho: 'KHO-A',
            tenKho: 'Kho A - Hà Nội',
            diaChi: '123 Đường Láng, Đống Đa, Hà Nội',
            quanLy: 'Trần Thị Mai',
            quanLyId: 2,
            soLuongTon: 1250,
            giaTriTon: '₫145,000,000',
            trangThai: true,
            ngayTao: '2024-01-15'
        },
        {
            id: 2,
            maKho: 'KHO-B',
            tenKho: 'Kho B - TP.HCM',
            diaChi: '456 Nguyễn Huệ, Quận 1, TP.HCM',
            quanLy: 'Nguyễn Văn Hùng',
            quanLyId: 3,
            soLuongTon: 890,
            giaTriTon: '₫98,500,000',
            trangThai: true,
            ngayTao: '2024-02-20'
        },
        {
            id: 3,
            maKho: 'KHO-C',
            tenKho: 'Kho C - Đà Nẵng',
            diaChi: '789 Lê Duẩn, Hải Châu, Đà Nẵng',
            quanLy: 'Lê Thị Hoa',
            quanLyId: 4,
            soLuongTon: 450,
            giaTriTon: '₫52,300,000',
            trangThai: false,
            ngayTao: '2024-03-10'
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // create, edit, view
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        maKho: '',
        tenKho: '',
        diaChi: '',
        quanLyId: '',
        trangThai: true
    });

    const [errors, setErrors] = useState({});

    // Mock managers data
    const managers = [
        { id: 2, name: 'Trần Thị Mai' },
        { id: 3, name: 'Nguyễn Văn Hùng' },
        { id: 4, name: 'Lê Thị Hoa' },
        { id: 5, name: 'Phạm Văn Nam' },
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.maKho) {
            newErrors.maKho = 'Vui lòng nhập mã kho';
        } else if (dialogMode === 'create' && warehouses.some(w => w.maKho === formData.maKho)) {
            newErrors.maKho = 'Mã kho đã tồn tại';
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

    const handleOpenDialog = (mode, warehouse = null) => {
        setDialogMode(mode);
        setSelectedWarehouse(warehouse);

        if (mode === 'create') {
            setFormData({
                maKho: '',
                tenKho: '',
                diaChi: '',
                quanLyId: '',
                trangThai: true
            });
        } else if (mode === 'edit' && warehouse) {
            setFormData({
                maKho: warehouse.maKho,
                tenKho: warehouse.tenKho,
                diaChi: warehouse.diaChi,
                quanLyId: warehouse.quanLyId.toString(),
                trangThai: warehouse.trangThai
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

    const handleSubmit = () => {
        if (!validateForm()) return;

        const manager = managers.find(m => m.id === parseInt(formData.quanLyId));

        if (dialogMode === 'create') {
            const newWarehouse = {
                id: warehouses.length + 1,
                ...formData,
                quanLy: manager.name,
                quanLyId: parseInt(formData.quanLyId),
                soLuongTon: 0,
                giaTriTon: '₫0',
                ngayTao: new Date().toISOString().split('T')[0]
            };
            setWarehouses([...warehouses, newWarehouse]);
            setSuccessMessage('Thêm kho mới thành công!');
        } else if (dialogMode === 'edit') {
            setWarehouses(warehouses.map(w =>
                w.id === selectedWarehouse.id
                    ? { ...w, ...formData, quanLy: manager.name, quanLyId: parseInt(formData.quanLyId) }
                    : w
            ));
            setSuccessMessage('Cập nhật thông tin kho thành công!');
        }

        setShowDialog(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleDelete = (warehouse) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${warehouse.tenKho}"?`)) {
            setWarehouses(warehouses.filter(w => w.id !== warehouse.id));
            setSuccessMessage('Xóa kho thành công!');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const filteredWarehouses = warehouses.filter(warehouse => {
        const matchesSearch = warehouse.tenKho.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.maKho.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.diaChi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && warehouse.trangThai) ||
            (filterStatus === 'inactive' && !warehouse.trangThai);
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: warehouses.length,
        active: warehouses.filter(w => w.trangThai).length,
        inactive: warehouses.filter(w => !w.trangThai).length,
        totalStock: warehouses.reduce((sum, w) => sum + w.soLuongTon, 0)
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <WarehouseHeader onAddWarehouse={() => handleOpenDialog('create')} />

                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <WarehouseStats stats={stats} />

                {/* Search and Filter */}
                <WarehouseSearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                />

                {/* Warehouse Cards */}
                {filteredWarehouses.length > 0 ? (
                    <WarehouseList
                        warehouses={filteredWarehouses}
                        onView={(warehouse) => handleOpenDialog('view', warehouse)}
                        onEdit={(warehouse) => handleOpenDialog('edit', warehouse)}
                        onDelete={handleDelete}
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
                    onSubmit={handleSubmit}
                    onClose={handleCloseDialog}
                />
            </div>
        </div>
    );
}