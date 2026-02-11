import React, { useRef } from 'react';
import Barcode from 'react-barcode';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { Printer } from "lucide-react";

export default function BarcodePrint({ isOpen, onClose, products = [] }) {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'In Mã Vạch',
    });

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>In Mã Vạch Sản Phẩm</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 border rounded bg-gray-50">
                    <div
                        ref={componentRef}
                        className="bg-white p-8 grid grid-cols-3 gap-6 print:grid-cols-3 print:gap-4"
                        style={{ width: '100%', minHeight: '100%' }}
                    >
                        {products.map((product, index) => {
                            // Xử lý logic để lấy danh sách cần in. 
                            // Nếu product có bienTheSanPhams, in từng biến thể. 
                            // Nếu không, in sản phẩm chính (dùng maVach hoặc id làm barcode tạm)
                            const itemsToPrint = product.bienTheSanPhams && product.bienTheSanPhams.length > 0
                                ? product.bienTheSanPhams
                                : [product];

                            return itemsToPrint.map((item, idx) => (
                                <div key={`${product.id}-${idx}`} className="flex flex-col items-center justify-center border p-4 break-inside-avoid">
                                    <div className="text-sm font-bold mb-1 text-center truncate w-full">
                                        {product.tenSanPham}
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {item.mauSac?.tenMau} - {item.size?.tenSize}
                                    </div>
                                    <Barcode
                                        value={item.maVach || item.maVachSku || item.maSku || `SP-${item.id}`}
                                        width={1.5}
                                        height={50}
                                        fontSize={12}
                                    />
                                    <div className="mt-2 font-bold text-lg">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giaBan || item.giaBanMacDinh || 0)}
                                    </div>
                                </div>
                            ));
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                    <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700 text-white flex gap-2">
                        <Printer size={16} />
                        In ngay
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
