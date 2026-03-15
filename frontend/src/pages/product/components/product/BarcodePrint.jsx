import React, { useMemo, useRef } from 'react';
import Barcode from 'react-barcode';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { Printer, ScanBarcode } from "lucide-react";

export default function BarcodePrint({ isOpen, onClose, products = [] }) {
    const componentRef = useRef();

    const printableItems = useMemo(() => {
        return products.flatMap((product) => {
            const itemsToPrint = product?.bienTheSanPhams?.length
                ? product.bienTheSanPhams
                : [product];

            return itemsToPrint.map((item, idx) => ({
                product,
                item,
                key: `${product?.id || 'p'}-${item?.id || idx}-${idx}`,
            }));
        });
    }, [products]);

    const totalProducts = products.length;
    const totalLabels = printableItems.length;
    const isSingleLabel = totalLabels <= 1;

    const getBarcodeValue = (item) => (
        item?.maVachSku ||
        item?.maSku ||
        item?.maVach ||
        item?.maBienThe ||
        `SP-${item?.id || 'NA'}`
    );

    const formatMoney = (value = 0) => (
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    );

    const getBarcodeStyle = (value) => {
        const length = String(value || '').length;

        if (length >= 28) return { width: 0.92, fontSize: 10 };
        if (length >= 24) return { width: 1.02, fontSize: 10 };
        if (length >= 20) return { width: 1.12, fontSize: 10 };
        if (length >= 16) return { width: 1.22, fontSize: 11 };
        return { width: 1.34, fontSize: 11 };
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'In Mã Vạch',
        onAfterPrint: () => {
            console.log('Printed successfully');
            // Optional: onClose(); // Close modal after printing?
        }
    });

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-5xl max-h-[90vh] flex flex-col !bg-[#fffdf8] !text-[#2f2a23] border border-[#e8dcc8] shadow-2xl"
                style={{ colorScheme: 'light' }}
            >
                <DialogHeader className="print:hidden border-b border-[#e8dcc8] pb-3">
                    <DialogTitle className="flex items-center gap-2.5 text-[#3f3428]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-sm">
                            <ScanBarcode size={16} />
                        </span>
                        <span className="flex flex-col">
                            <span className="text-lg font-semibold tracking-tight">In Mã Vạch Sản Phẩm</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7355]">
                                Product Barcode Center
                            </span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-3 border border-[#eadfce] rounded-xl bg-gradient-to-b from-[#fbf6ee] to-[#f7f1e7]">
                    <div
                        ref={componentRef}
                        className={`print-area grid gap-3 bg-transparent p-0.5 print:grid-cols-2 print:gap-1.5 print:p-0 ${isSingleLabel ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
                    >
                        {printableItems.length > 0 ? (
                            printableItems.map(({ product, item, key }) => (
                                (() => {
                                    const barcodeValue = getBarcodeValue(item);
                                    const barcodeStyle = getBarcodeStyle(barcodeValue);

                                    return (
                                <div
                                    key={key}
                                    className={`break-inside-avoid w-full rounded-xl border border-[#decfb8] bg-white p-3 shadow-sm print:max-w-[300px] print:rounded-none print:border print:border-black/20 print:shadow-none ${isSingleLabel ? "max-w-[420px] mx-auto" : "max-w-[292px]"}`}
                                >
                                    <div className="mb-2.5 flex items-start justify-between gap-1.5 border-b border-dashed border-[#eadfce] pb-1.5">
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-[13px] font-bold uppercase tracking-[0.01em] text-[#2f2a23] leading-tight">
                                                {product?.tenSanPham || 'Sản phẩm'}
                                            </p>
                                            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-[#8b7355]">
                                                Màu: {item?.mauSac?.tenMau || '-'} | Size: {item?.size?.tenSize || '-'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-md border border-[#e8dcc8] bg-[#fdf7ee] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#7a6549]">
                                            Tem
                                        </span>
                                    </div>

                                    <div className="rounded-lg border border-[#f0e5d4] bg-white px-2 py-2 overflow-hidden">
                                        <div className="barcode-fit flex w-full items-center justify-center overflow-hidden">
                                            <Barcode
                                                value={barcodeValue}
                                                width={barcodeStyle.width}
                                                height={56}
                                                fontSize={barcodeStyle.fontSize}
                                                background="#ffffff"
                                                lineColor="#111111"
                                                textMargin={2}
                                                margin={0}
                                                className="barcode-svg"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-2.5 flex items-end justify-between gap-2">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-[0.12em] text-[#8b7355]">SKU</p>
                                            <p className="text-[10px] font-bold text-[#5e4d37] font-mono leading-tight">
                                                {item?.maSku || item?.maBienThe || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase tracking-[0.12em] text-[#8b7355]">Giá bán</p>
                                            <p className="text-base font-black text-[#b8860b] leading-tight">
                                                {formatMoney(item?.giaBan || item?.giaBanMacDinh || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                    );
                                })()
                            ))
                        ) : (
                            <div className="col-span-full flex min-h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-[#dbc8ab] bg-white/70 p-6 text-center">
                                <div>
                                    <p className="text-base font-semibold text-[#6e5b43]">Không có dữ liệu in mã vạch</p>
                                    <p className="mt-1 text-xs text-[#8b7355]">Hãy chọn biến thể sản phẩm trước khi thực hiện in tem.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="print:hidden flex justify-end gap-2.5 mt-3 px-0.5 pb-0.5">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-white text-[#5f513d] border-[#d9c8ad] hover:bg-[#f8f1e5] h-10 px-6 rounded-xl font-medium"
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={handlePrint}
                        disabled={totalLabels === 0}
                        className="bg-gradient-to-r from-[#b8860b] to-[#d6a319] text-white border border-[#b8860b] hover:brightness-105 disabled:opacity-50 shadow-sm transition-all duration-200 flex gap-2 h-10 px-6 rounded-xl font-bold uppercase text-[11px] tracking-[0.12em] active:scale-95"
                    >
                        <Printer size={16} />
                        In mã vạch
                    </Button>
                </div>

                <style>{`
                    .barcode-fit .barcode-svg {
                        display: block;
                        max-width: 100%;
                        margin-left: auto;
                        margin-right: auto;
                    }

                    @media print {
                        .print-area {
                            width: 100%;
                            margin: 0;
                            padding: 0;
                        }

                        .print-area > * {
                            page-break-inside: avoid;
                        }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
