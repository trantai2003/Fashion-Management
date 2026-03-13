import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Warehouse } from "lucide-react";
import { khoService } from "@/services/khoService";
import { quyenHanService } from "@/services/quyenHan";
import PermissionMatrix from "./PermissionMatrix";
import { toast } from "react-toastify";
import { parseDateTimeToIsoString } from "@/utils/formatters";

export default function AssignWarehousePermissionModal({
    open,
    onClose,
    userId,
    onAssigned,
}) {
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [ghiChu, setGhiChu] = useState("")
    const [ngayKetThuc, setNgayKetThuc] = useState(null);
    const pageSize = 20;

    const selectedWarehouseCount = useMemo(
        () => warehouses.filter((w) => w.isSelected).length,
        [warehouses]
    );

    const selectedPermissionCount = useMemo(
        () => Object.values(selectedPermissions || {}).filter(Boolean).length,
        [selectedPermissions]
    );

    const canSubmitAssign = selectedWarehouseCount > 0 && selectedPermissionCount > 0;

    const resetState = useCallback(() => {
        setWarehouses([]);
        setPage(0);
        setHasMore(true);
        setLoading(false);
        setLoadingMore(false);
        setAssigning(false);
        setSelectedPermissions({});
        setGhiChu("");
        setNgayKetThuc(null);
    }, []);

    const mapKhoToItem = (warehouse) => ({
        id: warehouse.id,
        maKho: warehouse.maKho,
        tenKho: warehouse.tenKho,
        diaChi: warehouse.diaChi,
        trangThai: warehouse.trangThai,
        isSelected: false,
        isManager: false,
    });

    const loadWarehouses = useCallback(
        async (pageToLoad) => {
            if (pageToLoad === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const res = await khoService.filter({
                    page: pageToLoad,
                    size: pageSize,
                });

                const content = res?.data?.data?.content || [];

                setWarehouses((prev) => {
                    const existingById = new Map(prev.map((warehouse) => [warehouse.id, warehouse]));
                    const next = [...prev];

                    content.forEach((k) => {
                        const existing = existingById.get(k.id);
                        if (existing) {
                            // giữ lại trạng thái chọn hiện tại
                            next[next.indexOf(existing)] = {
                                ...existing,
                                maKho: k.maKho,
                                tenKho: k.tenKho,
                                diaChi: k.diaChi,
                                trangThai: k.trangThai,
                            };
                        } else {
                            next.push(mapKhoToItem(k));
                        }
                    });

                    return next;
                });

                setPage(pageToLoad);
                if (content.length < pageSize) {
                    setHasMore(false);
                }
            } catch (e) {
                console.error("Lỗi load danh sách kho", e);
                setHasMore(false);
            } finally {
                if (pageToLoad === 0) {
                    setLoading(false);
                } else {
                    setLoadingMore(false);
                }
            }
        },
        [pageSize]
    );

    useEffect(() => {
        if (open) {
            resetState();
            loadWarehouses(0);
        } else {
            resetState();
        }
    }, [open, loadWarehouses, resetState]);

    const handleScrollWarehouses = (e) => {
        const el = e.currentTarget;
        if (
            !loadingMore &&
            hasMore &&
            el.scrollHeight - el.scrollTop - el.clientHeight < 80
        ) {
            loadWarehouses(page + 1);
        }
    };

    const toggleWarehouseSelected = (warehouseId) => {
        setWarehouses((prev) =>
            prev.map((warehouse) =>
                warehouse.id === warehouseId
                    ? {
                        ...warehouse,
                        isSelected: !warehouse.isSelected,
                        isManager: warehouse.isSelected ? false : warehouse.isManager,
                    }
                    : warehouse
            )
        );
    };

    const toggleWarehouseManager = (warehouseId) => {
        setWarehouses((prev) =>
            prev.map((warehouse) =>
                warehouse.id === warehouseId
                    ? {
                        ...warehouse,
                        isManager: !warehouse.isManager,
                    }
                    : warehouse
            )
        );
    };

    const handleAssignSubmit = async () => {
        const permissionIds = Object.keys(selectedPermissions || {})
            .filter((k) => selectedPermissions[k])
            .map((k) => Number(k));

        const selectedWarehouses = warehouses.filter((warehouse) => warehouse.isSelected);

        if (!permissionIds.length || !selectedWarehouses.length || !userId) {
            return;
        }

        try {
            setAssigning(true);
            // Lấy mốc tgian hiện tại cho field ngayBatDau
            const nowIso = new Date().toISOString();
            // Gọi API cho từng kho một (mỗi kho 1 request)
            for (const warehouse of selectedWarehouses) {
                // payload submit api 
                const payload = {
                    nguoiDungId: Number(userId),
                    khoId: warehouse.id,
                    laQuanLyKho: warehouse.isManager ? 1 : 0,
                    ngayBatDau: nowIso,
                    ngayKetThuc: ngayKetThuc ? parseDateTimeToIsoString(ngayKetThuc) : null,
                    ghiChu: ghiChu,
                    chiTietQuyenKhos: permissionIds.map((pid) => ({
                        quyenHanId: pid,
                        trangThai: 1,
                    })),
                };

                await quyenHanService.ganQuyenQuyenHan({
                    khoId: warehouse.id,
                    payload,
                });
            }

            await onAssigned?.();
            toast.success("Phân quyền kho thành công");
            onClose();
        } catch (e) {
            console.error("Lỗi phân quyền kho cho người dùng", e);
        } finally {
            setAssigning(false);
        }
    };

    const handleClose = () => {
        if (assigning) return;
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
            <DialogContent className="w-[95vw] max-w-3xl bg-white text-gray-900 border border-gray-200 rounded-xl shadow-sm dark:bg-white dark:text-gray-900 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-purple-600" />
                        Thêm phân quyền kho
                    </DialogTitle>
                    <DialogDescription>
                        Bước 1: Chọn kho phụ trách • Bước 2: Chọn quyền chức năng áp dụng
                        cho các kho đã chọn.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Step 1: Chọn kho */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider italic">
                                1. Chọn kho phụ trách
                            </p>
                            <span className="text-[10px] text-gray-400">
                                * Bắt buộc chọn ít nhất 1 kho
                            </span>
                        </div>

                        {loading && warehouses.length === 0 ? (
                            <p className="text-xs text-gray-500">Đang tải danh sách kho...</p>
                        ) : warehouses.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">
                                Chưa có kho nào. Vui lòng tạo kho trước khi phân quyền.
                            </p>
                        ) : (
                            <div
                                className="space-y-3 max-h-64 overflow-y-auto pr-1"
                                onScroll={handleScrollWarehouses}
                            >
                                {warehouses.map((warehouse) => (
                                    <div
                                        key={warehouse.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border
                        ${warehouse.isSelected
                                                ? "bg-gray-50 border-purple-100"
                                                : "bg-white border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={warehouse.isSelected}
                                                onChange={() => toggleWarehouseSelected(warehouse.id)}
                                                className="h-5 w-5 rounded text-purple-600"
                                            />

                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {warehouse.tenKho}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono uppercase">
                                                    {warehouse.maKho} • ID: {warehouse.id}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                                                    {warehouse.diaChi}
                                                </p>
                                            </div>
                                        </div>

                                        {warehouse.isSelected && (
                                            <button
                                                type="button"
                                                onClick={() => toggleWarehouseManager(warehouse.id)}
                                                className={`text-[10px] font-bold px-3 py-1.5 rounded border shadow-sm
                            ${warehouse.isManager
                                                        ? "bg-purple-600 text-white border-purple-600"
                                                        : "bg-white text-gray-400 border-gray-200"
                                                    }`}
                                            >
                                                QUẢN LÝ CHÍNH
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {loadingMore && (
                                    <p className="text-[11px] text-gray-400 text-center py-1">
                                        Đang tải thêm kho...
                                    </p>
                                )}
                                {!hasMore && warehouses.length > 0 && (
                                    <p className="text-[11px] text-gray-400 text-center py-1">
                                        Đã hiển thị tất cả kho.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Step 2: Chọn quyền */}
                    <section>
                        <div className="mb-3">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider italic">
                                2. Chọn quyền chức năng
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Các quyền sẽ được áp dụng cho toàn bộ kho được chọn ở bước 1.
                            </p>
                        </div>

                        <div
                            className={
                                selectedWarehouseCount === 0
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                            }
                        >
                            <PermissionMatrix
                                selectedPermissions={selectedPermissions}
                                setSelectedPermissions={setSelectedPermissions}
                            />
                        </div>
                        {selectedWarehouseCount === 0 && (
                            <p className="text-[11px] text-red-500 mt-2">
                                Vui lòng chọn ít nhất 1 kho ở bước 1 trước khi cấu hình quyền.
                            </p>
                        )}
                    </section>

                    <section>
                        <div className="flex flex-col gap-2 mb-3">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider italic">3. Cấu hình bổ sung</p>
                            <div>
                                <p className="text-[11px] text-gray-500">
                                    Ghi chú
                                </p>
                                <textarea
                                    className="w-full p-2 border border-gray-200 rounded-md"
                                    placeholder="Nhập ghi chú"
                                    value={ghiChu}
                                    onChange={(e) => setGhiChu(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500">
                                    Ngày kết thúc
                                </p>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border border-gray-200 rounded-md"
                                    value={ngayKetThuc}
                                    onChange={(e) => setNgayKetThuc(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <DialogFooter className="flex gap-2 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={assigning}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAssignSubmit}
                        disabled={assigning || !canSubmitAssign}
                        className="bg-linear-to-r from-purple-600 to-blue-600"
                    >
                        {assigning ? "Đang lưu..." : "Lưu phân quyền"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

