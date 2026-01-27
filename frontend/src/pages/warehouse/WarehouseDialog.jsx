import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Warehouse,
    MapPin,
    User,
    Package,
    TrendingUp,
    Calendar,
    AlertCircle,
    ChevronDown,
    Check
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

export default function WarehouseDialog({
    showDialog,
    setShowDialog,
    dialogMode,
    selectedWarehouse,
    formData,
    setFormData,
    errors,
    managers,
    isLoadingManagers,
    onSubmit,
    onClose
}) {
    const managerLabel = formData.quanLyId
        ? managers.find(m => m.id.toString() === formData.quanLyId)?.name
        : 'Chọn người quản lý';

    return (
        <Dialog
            open={showDialog}
            onOpenChange={(open) => {
                if (!open) onClose();
                else setShowDialog(true);
            }}
        >

            <DialogContent className="w-[95vw] max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-purple-600" />
                        {dialogMode === 'create' && 'Thêm kho mới'}
                        {dialogMode === 'edit' && 'Chỉnh sửa thông tin kho'}
                        {dialogMode === 'view' && 'Thông tin chi tiết kho'}
                    </DialogTitle>
                    <DialogDescription>
                        {dialogMode === 'create' && 'Điền thông tin để tạo kho hàng mới'}
                        {dialogMode === 'edit' && 'Cập nhật thông tin kho hàng'}
                        {dialogMode === 'view' && 'Xem chi tiết thông tin và hoạt động của kho'}
                    </DialogDescription>
                </DialogHeader>

                {dialogMode === 'view' ? (
                    /* View Mode */
                    <div className="space-y-5">
                        {/* Mã kho và Trạng thái */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal">Mã kho</Label>
                                <p className="font-semibold text-base">{selectedWarehouse?.maKho}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal">Trạng thái</Label>
                                <div>
                                    {selectedWarehouse?.trangThai === 1 ? (
                                        <Badge className="bg-gray-900 hover:bg-gray-800 text-white border-0 px-3 py-1">
                                            Hoạt động
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="px-3 py-1">
                                            Không hoạt động
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tên kho */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 font-normal">Tên kho</Label>
                            <p className="font-semibold text-base">{selectedWarehouse?.tenKho}</p>
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 font-normal flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Địa chỉ
                            </Label>
                            <p className="text-base">{selectedWarehouse?.diaChi}</p>
                        </div>

                        {/* Người quản lý */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 font-normal flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Người quản lý
                            </Label>
                            <p className="font-semibold text-base">{selectedWarehouse?.quanLy?.hoTen || 'N/A'}</p>
                        </div>

                        {/* Số lượng tồn kho và Giá trị tồn kho */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Số lượng tồn kho
                                </Label>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatNumber(selectedWarehouse?.soLuongTon)}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Giá trị tồn kho
                                </Label>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedWarehouse?.giaTriTon)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Ngày tạo */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 font-normal flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ngày tạo
                            </Label>
                            <p className="text-base">{formatDate(selectedWarehouse?.ngayTao)}</p>
                        </div>
                    </div>
                ) : (
                    /* Create/Edit Mode */
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Mã kho */}
                            <div className="space-y-2">
                                <Label htmlFor="maKho">Mã kho *</Label>
                                <Input
                                    id="maKho"
                                    placeholder="VD: KHO-D"
                                    value={formData.maKho}
                                    onChange={(e) =>
                                        setFormData({ ...formData, maKho: e.target.value.toUpperCase() })
                                    }
                                    disabled={dialogMode === "edit"}
                                />
                                {errors.maKho && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.maKho}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Trạng thái - DROPDOWN */}
                            <div className="space-y-2">
                                <Label>Trạng thái *</Label>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-left text-sm flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <span>{formData.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động'}</span>
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="start"
                                        className="w-[--radix-dropdown-menu-trigger-width] bg-white border border-gray-200 shadow-xl rounded-xl"
                                    >
                                        <DropdownMenuItem
                                            onClick={() => setFormData({ ...formData, trangThai: 1 })}
                                            className="flex items-center justify-between bg-white hover:bg-gray-100 cursor-pointer"
                                        >
                                            Hoạt động
                                            {Number(formData.trangThai) === 1 && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => setFormData({ ...formData, trangThai: 0 })}
                                            className="flex items-center justify-between bg-white hover:bg-gray-100 cursor-pointer"
                                        >
                                            Không hoạt động
                                            {Number(formData.trangThai) === 0 && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Tên kho */}
                        <div className="space-y-2">
                            <Label htmlFor="tenKho">Tên kho *</Label>
                            <Input
                                id="tenKho"
                                placeholder="VD: Kho D - Cần Thơ"
                                value={formData.tenKho}
                                onChange={(e) => setFormData({ ...formData, tenKho: e.target.value })}
                            />
                            {errors.tenKho && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{errors.tenKho}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2">
                            <Label htmlFor="diaChi">Địa chỉ *</Label>
                            <Textarea
                                id="diaChi"
                                placeholder="Nhập địa chỉ đầy đủ của kho"
                                rows={3}
                                value={formData.diaChi}
                                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                            />
                            {errors.diaChi && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{errors.diaChi}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Người quản lý - DROPDOWN */}
                        <div className="space-y-2">
                            <Label>Người quản lý *</Label>

                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-left text-sm flex items-center justify-between hover:bg-gray-50"
                                        disabled={isLoadingManagers}
                                    >
                                        <span className={formData.quanLyId ? "" : "text-gray-400"}>
                                            {isLoadingManagers ? "Đang tải..." : managerLabel}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="start"
                                    className="w-[--radix-dropdown-menu-trigger-width] bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 overflow-auto"
                                >
                                    {managers.length === 0 ? (
                                        <div className="p-2 text-sm text-gray-500 text-center">
                                            Không có người quản lý
                                        </div>
                                    ) : (
                                        managers.map((m) => (
                                            <DropdownMenuItem
                                                key={m.id}
                                                onClick={() => setFormData({ ...formData, quanLyId: m.id.toString() })}
                                                className="flex items-center justify-between bg-white hover:bg-gray-100 cursor-pointer"
                                            >
                                                {m.name}
                                                {formData.quanLyId === m.id.toString() && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {errors.quanLyId && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{errors.quanLyId}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
                    </Button>
                    {dialogMode !== 'view' && (
                        <Button
                            onClick={onSubmit}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            {dialogMode === 'create' ? 'Thêm kho' : 'Cập nhật'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
