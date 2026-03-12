import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { Printer } from "lucide-react";

export default function BarcodePrint({ isOpen, onClose, products = [] }) {
    const componentRef = useRef();

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
                className="max-w-4xl max-h-[90vh] flex flex-col !bg-white !text-black border-gray-200"
                style={{ colorScheme: 'light' }}
            >
                <DialogHeader>
                    <DialogTitle className="!text-gray-900">In Mã Vạch Sản Phẩm</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 border border-gray-200 rounded bg-gray-50">
                    <div
                        ref={componentRef}
                        className="bg-white p-4 flex flex-col items-center gap-8 print:p-0 print-area"
                    >
                        {products.map((product) => {
                            const itemsToPrint = product.bienTheSanPhams && product.bienTheSanPhams.length > 0
                                ? product.bienTheSanPhams
                                : [product];

                            return itemsToPrint.map((item, idx) => (
                                <div key={`${product.id}-${idx}`} className="flex flex-col items-center justify-center border border-dashed border-gray-300 p-6 bg-white w-[300px] mb-4 last:mb-0 print:border-none print:shadow-none print:mb-0 break-inside-avoid">
                                    <div className="text-sm font-black mb-1 text-center uppercase tracking-tighter text-black">
                                        {product.tenSanPham}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mb-3 font-medium uppercase">
                                        Màu: {item.mauSac?.tenMau || '-'} | Size: {item.size?.tenSize || '-'}
                                    </div>
                                    <div className="bg-white py-2 px-4 rounded border border-gray-100 mb-3">
                                        <Barcode
                                            value={item.maVachSku || item.maSku || item.maVach || item.maBienThe || `SP-${item.id}`}
                                            width={1.8}
                                            height={60}
                                            fontSize={14}
                                            background="#ffffff"
                                            lineColor="#000000"
                                            margin={0}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                         <div className="text-2xl font-black text-purple-600 tracking-tighter">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giaBan || item.giaBanMacDinh || 0)}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-mono uppercase">
                                            SKU: {item.maSku || item.maBienThe || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            ));
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 px-6 pb-6">
                    <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        Đóng
                    </Button>
                    <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700 text-white flex gap-2 h-11 px-8 rounded-xl shadow-lg shadow-purple-100 font-bold uppercase text-xs tracking-widest transition-all active:scale-95">
                        <Printer size={16} />
                        In mã vạch / Xuất PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
