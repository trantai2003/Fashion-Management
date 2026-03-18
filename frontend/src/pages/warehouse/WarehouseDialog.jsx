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
            <DialogContent
                className="w-[95vw] max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden"
                style={{ background: "#faf7f0", color: "#0f172a", outline: "none" }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4" style={{ background: "#faf7f0" }}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: "#0f172a" }}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0" style={{ background: "#fef9c3" }}>
                                <Warehouse className="w-4 h-4" style={{ color: "#ca8a04" }} />
                            </div>
                            {dialogMode === 'create' && 'Thêm kho mới'}
                            {dialogMode === 'edit' && 'Chỉnh sửa thông tin kho'}
                            {dialogMode === 'view' && 'Thông tin chi tiết kho'}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 pb-2" style={{ background: "#faf7f0" }}>
                    {dialogMode === 'view' ? (
                        /* ── View Mode ── */
                        <div className="space-y-5">
                            {/* Mã kho và Trạng thái */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Mã kho</Label>
                                    <p className="font-semibold text-base" style={{ color: "#0f172a" }}>{selectedWarehouse?.maKho}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Trạng thái</Label>
                                    <div>
                                        {selectedWarehouse?.trangThai === 1 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>
                                                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "#16a34a" }} />
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                                                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "#94a3b8" }} />
                                                Không hoạt động
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tên kho */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Tên kho</Label>
                                <p className="font-semibold text-base" style={{ color: "#0f172a" }}>{selectedWarehouse?.tenKho}</p>
                            </div>

                            {/* Địa chỉ */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                    <MapPin className="w-3.5 h-3.5" /> Địa chỉ
                                </Label>
                                <p className="text-sm" style={{ color: "#334155" }}>{selectedWarehouse?.diaChi}</p>
                            </div>

                            {/* Người quản lý */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                    <User className="w-3.5 h-3.5" /> Người quản lý
                                </Label>
                                <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>{selectedWarehouse?.quanLy?.hoTen || 'N/A'}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                        <Package className="w-3.5 h-3.5" /> Số lượng tồn kho
                                    </Label>
                                    <div className="p-4 rounded-xl" style={{ background: "#fef9c3", border: "1px solid #fde68a" }}>
                                        <p className="text-2xl font-bold" style={{ color: "#92400e" }}>
                                            {formatNumber(selectedWarehouse?.soLuongTon)}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                        <TrendingUp className="w-3.5 h-3.5" /> Giá trị tồn kho
                                    </Label>
                                    <div className="p-4 rounded-xl" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                                        <p className="text-2xl font-bold" style={{ color: "#166534" }}>
                                            {formatCurrency(selectedWarehouse?.giaTriTon)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ngày tạo */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#64748b" }}>
                                    <Calendar className="w-3.5 h-3.5" /> Ngày tạo
                                </Label>
                                <p className="text-sm" style={{ color: "#334155" }}>{formatDate(selectedWarehouse?.ngayTao)}</p>
                            </div>
                        </div>
                    ) : (
                        /* ── Create / Edit Mode ── */
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Mã kho */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="maKho" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                        Mã kho *
                                    </Label>
                                    <Input
                                        id="maKho"
                                        placeholder="VD: KHO-D"
                                        value={formData.maKho}
                                        onChange={(e) =>
                                            setFormData({ ...formData, maKho: e.target.value.toUpperCase() })
                                        }
                                        disabled={dialogMode === "edit"}
                                        style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0f172a" }}
                                        className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                                    />
                                    {errors.maKho && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.maKho}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Trạng thái */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                        Trạng thái *
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
                                                <span>{formData.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động'}</span>
                                                <ChevronDown className="h-4 w-4" style={{ color: "#9ca3af" }} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="w-[--radix-dropdown-menu-trigger-width] rounded-xl shadow-xl border"
                                            style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
                                        >
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, trangThai: 1 })}
                                                className="flex items-center justify-between cursor-pointer"
                                                style={{ color: "#0f172a" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fef9c3"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                            >
                                                Hoạt động
                                                {Number(formData.trangThai) === 1 && <Check className="h-4 w-4" style={{ color: "#ca8a04" }} />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setFormData({ ...formData, trangThai: 0 })}
                                                className="flex items-center justify-between cursor-pointer"
                                                style={{ color: "#0f172a" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fef9c3"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                            >
                                                Không hoạt động
                                                {Number(formData.trangThai) === 0 && <Check className="h-4 w-4" style={{ color: "#ca8a04" }} />}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Tên kho */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tenKho" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                    Tên kho *
                                </Label>
                                <Input
                                    id="tenKho"
                                    placeholder="VD: Kho D - Cần Thơ"
                                    value={formData.tenKho}
                                    onChange={(e) => setFormData({ ...formData, tenKho: e.target.value })}
                                    style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0f172a" }}
                                    className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                                />
                                {errors.tenKho && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.tenKho}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Địa chỉ */}
                            <div className="space-y-1.5">
                                <Label htmlFor="diaChi" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                    Địa chỉ *
                                </Label>
                                <Textarea
                                    id="diaChi"
                                    placeholder="Nhập địa chỉ đầy đủ của kho"
                                    rows={3}
                                    value={formData.diaChi}
                                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                                    style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0f172a" }}
                                    className="focus:border-yellow-500 focus:ring-yellow-500 resize-none"
                                />
                                {errors.diaChi && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.diaChi}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Người quản lý */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                                    Người quản lý *
                                </Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-10 w-full rounded-md px-3 text-left text-sm flex items-center justify-between transition-colors duration-150"
                                            style={{ background: "#ffffff", border: "1px solid #e5e7eb", color: formData.quanLyId ? "#0f172a" : "#9ca3af" }}
                                            disabled={isLoadingManagers}
                                            onMouseEnter={e => { if (!isLoadingManagers) e.currentTarget.style.background = "#faf7f0"; }}
                                            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                                        >
                                            <span>{isLoadingManagers ? "Đang tải..." : managerLabel}</span>
                                            <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "#9ca3af" }} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="start"
                                        className="w-[--radix-dropdown-menu-trigger-width] rounded-xl shadow-xl border max-h-60 overflow-auto"
                                        style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
                                    >
                                        {managers.length === 0 ? (
                                            <div className="p-3 text-sm text-center" style={{ color: "#64748b" }}>
                                                Không có người quản lý
                                            </div>
                                        ) : (
                                            managers.map((m) => (
                                                <DropdownMenuItem
                                                    key={m.id}
                                                    onClick={() => setFormData({ ...formData, quanLyId: m.id.toString() })}
                                                    className="flex items-center justify-between cursor-pointer"
                                                    style={{ color: "#0f172a" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "#fef9c3"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                >
                                                    {m.name}
                                                    {formData.quanLyId === m.id.toString() && <Check className="h-4 w-4" style={{ color: "#ca8a04" }} />}
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
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4" style={{ background: "#f5efe0", borderTop: "1px solid #ede8db" }}>
                    <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                        style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#faf7f0"}
                        onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                        onClick={onClose}
                    >
                        {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
                    </button>
                    {dialogMode !== 'view' && (
                        <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-bold transition-all duration-150"
                            style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#ca8a04"}
                            onMouseLeave={e => e.currentTarget.style.background = "#eab308"}
                            onClick={onSubmit}
                        >
                            {dialogMode === 'create' ? 'Thêm kho' : 'Cập nhật'}
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}