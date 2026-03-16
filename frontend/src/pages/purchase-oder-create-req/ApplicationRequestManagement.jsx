import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
    CheckCircle, XCircle, Clock, RefreshCw, Search, Package,
    User, Warehouse, FileText, AlertCircle, Loader2, ChevronDown, Eye,
} from 'lucide-react';
import applicationRequestService from '@/services/applicationRequestService'; // adjust path

/* ─── helpers ─────────────────────────────────────────────────────── */
const STATUS = {
    0: { label: 'Đã từ chối', color: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle },
    1: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock },
    2: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
};

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/* ─── Main component ───────────────────────────────────────────────── */
export default function ApplicationRequestManagement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [notification, setNotification] = useState(null); // { type, msg }

    // Dialog: review confirmation
    const [reviewDialog, setReviewDialog] = useState(null); // { request, action: 'approve'|'reject' }
    const [reviewLoading, setReviewLoading] = useState(false);

    // Dialog: detail view
    const [detailDialog, setDetailDialog] = useState(null); // request object

    /* fetch */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await applicationRequestService.getAllRequests();
            setRequests(data);
        } catch (e) {
            notify('error', 'Không thể tải danh sách yêu cầu: ' + (e?.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* notify */
    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 5000);
    };

    /* review submit */
    const handleReviewConfirm = async () => {
        if (!reviewDialog) return;
        const { request, action } = reviewDialog;
        const status = action === 'approve' ? 2 : 0;
        setReviewLoading(true);
        try {
            await applicationRequestService.reviewRequest(request.nguoiDungId, status);
            notify('success', action === 'approve' ? 'Đã duyệt yêu cầu thành công.' : 'Đã từ chối yêu cầu.');
            setReviewDialog(null);
            load();
        } catch (e) {
            notify('error', e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setReviewLoading(false);
        }
    };

    /* filtered list */
    const filtered = requests.filter((r) => {
        const matchStatus = filterStatus === 'all' || String(r.trangThai) === filterStatus;
        const matchSearch =
            !search ||
            String(r.nguoiDungId).includes(search) ||
            String(r.khoId).includes(search) ||
            (r.ghiChu || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    /* stats */
    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.trangThai === 1).length,
        approved: requests.filter((r) => r.trangThai === 2).length,
        rejected: requests.filter((r) => r.trangThai === 0).length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-indigo-600" />
                            Quản lý Yêu cầu Tạo Đơn Mua Hàng
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Xem xét và duyệt / từ chối yêu cầu từ nhân viên mua hàng
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={load}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>

                {/* ── Notification ── */}
                {notification && (
                    <Alert className={notification.type === 'success'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'}>
                        <AlertDescription className={notification.type === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'}>
                            {notification.msg}
                        </AlertDescription>
                    </Alert>
                )}

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng yêu cầu', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
                        { label: 'Chờ duyệt', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                        { label: 'Đã duyệt', value: stats.approved, color: 'text-green-700', bg: 'bg-green-50' },
                        { label: 'Từ chối', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50' },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 shadow-sm`}>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm theo ID người dùng, kho, ghi chú..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    {/* Status filter buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: '1', label: 'Chờ duyệt' },
                            { value: '2', label: 'Đã duyệt' },
                            { value: '0', label: 'Từ chối' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterStatus(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === opt.value
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="font-bold text-slate-700">Người dùng ID</TableHead>
                                <TableHead className="font-bold text-slate-700">Kho ID</TableHead>
                                <TableHead className="font-bold text-slate-700">Sản phẩm (biến thể)</TableHead>
                                <TableHead className="font-bold text-slate-700">Ghi chú</TableHead>
                                <TableHead className="font-bold text-slate-700">Thời gian gửi</TableHead>
                                <TableHead className="font-bold text-slate-700">Trạng thái</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                        <p className="text-slate-500">Đang tải dữ liệu...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-slate-500 font-semibold">Không có yêu cầu nào</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((req, idx) => {
                                    const st = STATUS[req.trangThai] || STATUS[1];
                                    const StIcon = st.Icon;
                                    const isPending = req.trangThai === 1;
                                    return (
                                        <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-indigo-600" />
                                                    </div>
                                                    <span className="font-mono font-bold text-slate-800">#{req.nguoiDungId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Warehouse className="h-4 w-4 text-slate-400" />
                                                    <span className="font-semibold text-slate-700">Kho #{req.khoId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <span className="text-slate-700 font-semibold">
                                                        {req.bienTheSanPhamIds?.length ?? 0} biến thể
                                                    </span>
                                                    {req.bienTheSanPhamIds?.length > 0 && (
                                                        <button
                                                            onClick={() => setDetailDialog(req)}
                                                            className="ml-1 text-xs text-indigo-500 hover:underline font-medium"
                                                        >
                                                            Xem
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-600 max-w-[160px] truncate" title={req.ghiChu}>
                                                    {req.ghiChu || <span className="italic text-slate-400">Không có</span>}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                                                {fmtDate(req.taoLuc)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.color}`}>
                                                    <StIcon className="h-3.5 w-3.5" />
                                                    {st.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDetailDialog(req)}
                                                        className="h-8 px-2 gap-1 text-slate-600"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {isPending && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setReviewDialog({ request: req, action: 'approve' })}
                                                                className="h-8 px-3 gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Duyệt
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setReviewDialog({ request: req, action: 'reject' })}
                                                                className="h-8 px-3 gap-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Review Confirmation Dialog ── */}
            <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
                    <div className={`p-6 flex items-center gap-3 ${reviewDialog?.action === 'approve' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        {reviewDialog?.action === 'approve'
                            ? <CheckCircle className="h-6 w-6 text-white" />
                            : <XCircle className="h-6 w-6 text-white" />
                        }
                        <DialogTitle className="text-white font-bold text-lg m-0">
                            {reviewDialog?.action === 'approve' ? 'Xác nhận Duyệt Yêu cầu' : 'Xác nhận Từ chối Yêu cầu'}
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-slate-600 text-sm mb-4">
                            {reviewDialog?.action === 'approve'
                                ? 'Sau khi duyệt, nhân viên mua hàng có thể tạo đơn mua hàng với các biến thể trong yêu cầu này.'
                                : 'Yêu cầu sẽ bị từ chối. Nhân viên cần gửi lại yêu cầu mới nếu cần.'
                            }
                        </DialogDescription>

                        {reviewDialog && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Người dùng ID:</span>
                                    <span className="font-bold text-slate-800">#{reviewDialog.request.nguoiDungId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Kho:</span>
                                    <span className="font-bold text-slate-800">#{reviewDialog.request.khoId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Số biến thể:</span>
                                    <span className="font-bold text-slate-800">{reviewDialog.request.bienTheSanPhamIds?.length ?? 0}</span>
                                </div>
                                {reviewDialog.request.ghiChu && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500 font-medium shrink-0">Ghi chú:</span>
                                        <span className="text-slate-700 text-right">{reviewDialog.request.ghiChu}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="mt-6 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setReviewDialog(null)}
                                disabled={reviewLoading}
                                className="flex-1 rounded-xl"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleReviewConfirm}
                                disabled={reviewLoading}
                                className={`flex-1 rounded-xl font-semibold text-white shadow-md ${reviewDialog?.action === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {reviewLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang xử lý...</>
                                ) : reviewDialog?.action === 'approve' ? (
                                    <><CheckCircle className="h-4 w-4 mr-2" />Duyệt yêu cầu</>
                                ) : (
                                    <><XCircle className="h-4 w-4 mr-2" />Từ chối</>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ── */}
            <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Chi tiết Yêu cầu — Người dùng #{detailDialog?.nguoiDungId}
                        </DialogTitle>
                    </DialogHeader>
                    {detailDialog && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Kho</p>
                                    <p className="font-bold text-slate-800">#{detailDialog.khoId}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Trạng thái</p>
                                    {(() => {
                                        const st = STATUS[detailDialog.trangThai] || STATUS[1];
                                        const StIcon = st.Icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
                                                <StIcon className="h-3 w-3" />{st.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 col-span-2">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Thời gian gửi</p>
                                    <p className="font-semibold text-slate-700">{fmtDate(detailDialog.taoLuc)}</p>
                                </div>
                                {detailDialog.ghiChu && (
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 col-span-2">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Ghi chú</p>
                                        <p className="text-slate-700">{detailDialog.ghiChu}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5" />
                                    Danh sách Biến thể Sản phẩm ({detailDialog.bienTheSanPhamIds?.length ?? 0})
                                </p>
                                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                    {detailDialog.bienTheSanPhamIds?.length > 0 ? (
                                        detailDialog.bienTheSanPhamIds.map((id, i) => (
                                            <div
                                                key={id}
                                                className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                                    } border-b border-slate-100 last:border-0`}
                                            >
                                                <span className="text-slate-500 font-medium">#{i + 1}</span>
                                                <span className="font-mono font-bold text-indigo-700">ID: {id}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 text-sm">Không có biến thể</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDetailDialog(null)} className="rounded-xl">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}