import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Upload, X, Layers } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import * as yup from "yup";

// 1. Schema Validation
const editProductSchema = yup.object({
    tenSanPham: yup.string().required("Tên sản phẩm là bắt buộc"),
    maSanPham: yup.string().nullable(),
    maVach: yup.string().nullable(),
    danhMucId: yup.number().required("Danh mục là bắt buộc"),
    moTa: yup.string().nullable(),
    giaVonMacDinh: yup.number().typeError("Phải là số").min(0, "Giá vốn phải >= 0").required("Bắt buộc"),
    giaBanMacDinh: yup.number().typeError("Phải là số").min(0, "Giá bán phải >= 0").required("Bắt buộc"),
    mucTonToiThieu: yup.number().typeError("Phải là số").min(0, "Mức tồn phải >= 0"),
    trangThai: yup.number().required(),
    bienTheSanPhams: yup.array().of(
        yup.object({
            id: yup.number().required(),
            giaVon: yup.number().typeError("Phải là số").min(0, "Giá vốn phải >= 0").required("Bắt buộc"),
            giaBan: yup.number().typeError("Phải là số").min(0, "Giá bán phải >= 0").required("Bắt buộc"),
            trangThai: yup.number().required(),
            mauSac: yup.object().nullable(),
            size: yup.object().nullable(),
            chatLieu: yup.object().nullable(),
        })
    ).min(1, "Phải có ít nhất 1 biến thể")
});

export default function EditProductModal({ isOpen, onClose, onSuccess, productId }) {
    // State quản lý ảnh
    const [productImages, setProductImages] = useState([]);
    const [existingProductImages, setExistingProductImages] = useState([]);
    const [variantImages, setVariantImages] = useState({});
    const [existingVariantImages, setExistingVariantImages] = useState({});

    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [productImageUpdated, setProductImageUpdated] = useState(false);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(editProductSchema),
        defaultValues: {
            tenSanPham: "", maSanPham: "", maVach: "", danhMucId: 1,
            moTa: "", giaVonMacDinh: 0, giaBanMacDinh: 0, mucTonToiThieu: 0,
            trangThai: 1, bienTheSanPhams: [],
        }
    });

    const { fields } = useFieldArray({ control, name: "bienTheSanPhams" });

    // 2. Fetch chi tiết sản phẩm
    const fetchProductDetails = useCallback(async (id) => {
        try {
            setIsLoadingProduct(true);
            const res = await productService.getProductById(id);
            if (res.data?.status === 200) {
                const product = res.data.data;
                reset({
                    tenSanPham: product.tenSanPham || "",
                    maSanPham: product.maSanPham || "",
                    maVach: product.maVach || "",
                    danhMucId: product.danhMuc?.id || 1,
                    moTa: product.moTa || "",
                    giaVonMacDinh: product.giaVonMacDinh || 0,
                    giaBanMacDinh: product.giaBanMacDinh || 0,
                    mucTonToiThieu: product.mucTonToiThieu || 0,
                    trangThai: product.trangThai ?? 1,
                    bienTheSanPhams: product.bienTheSanPhams?.map(v => ({
                        id: v.id,
                        giaVon: v.giaVon || 0,
                        giaBan: v.giaBan || 0,
                        trangThai: v.trangThai ?? 1,
                        mauSac: v.mauSac,
                        size: v.size,
                        chatLieu: v.chatLieu
                    })) || []
                });

                setExistingProductImages(product.anhQuanAos || []);
                const vImgMap = {};
                product.bienTheSanPhams?.forEach((v, i) => {
                    if (v.anhBienThe) vImgMap[i] = v.anhBienThe;
                });
                setExistingVariantImages(vImgMap);
            }
        } catch (error) {
            toast.error("Không thể tải thông tin sản phẩm");
            onClose();
        } finally {
            setIsLoadingProduct(false);
        }
    }, [reset, onClose]);

    useEffect(() => {
        if (isOpen && productId) fetchProductDetails(productId);
    }, [isOpen, productId, fetchProductDetails]);

    // 3. Xử lý Submit
    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            const productData = {
                id: productId,
                ...data,
                isImageUpdated: productImageUpdated,
                bienTheSanPhams: data.bienTheSanPhams.map((v, index) => ({
                    id: v.id,
                    giaVon: Number(v.giaVon),
                    giaBan: Number(v.giaBan),
                    trangThai: Number(v.trangThai),
                    isImageUpdated: !!variantImages[index],
                })),
            };

            formData.append('updating', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

            if (productImageUpdated) {
                productImages.forEach((file) => formData.append('anhSanPhams', file));
            }

            data.bienTheSanPhams.forEach((_, index) => {
                formData.append('anhBienThes', variantImages[index] || new File([], 'empty.txt'));
            });

            const res = await productService.updateProduct(productId, formData);
            if (res?.data?.status < 400) {
                toast.success("Cập nhật sản phẩm thành công!");
                onSuccess();
                onClose();
            } else {
                toast.error(res?.data?.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            toast.error("Lỗi kết nối server");
        }
    };

    const handleCancel = () => {
        if (!isSubmitting) {
            reset();
            setProductImages([]);
            setVariantImages({});
            onClose();
        }
    };

    if (isLoadingProduct) return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="light sm:max-w-[400px] flex flex-col items-center py-10 !bg-white border-none shadow-2xl">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                <p className="mt-4 text-slate-600 font-medium">Đang tải thông tin...</p>
            </DialogContent>
        </Dialog>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent
                className="light sm:max-w-[900px] max-h-[95vh] p-0 overflow-hidden flex flex-col !bg-white !text-slate-900 border-none shadow-2xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden !bg-white">

                    <DialogHeader className="px-6 py-4 border-b !bg-slate-50/50">
                        <DialogTitle className="text-xl font-bold !text-purple-700">Chỉnh sửa sản phẩm</DialogTitle>
                        <DialogDescription className="!text-slate-500">Cập nhật giá và hình ảnh cho các biến thể hiện có.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 !bg-white">

                        {/* 1. THÔNG TIN CƠ BẢN */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold !text-slate-800 border-l-4 border-purple-500 pl-2 uppercase tracking-tight">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Tên sản phẩm *</Label>
                                    <Controller name="tenSanPham" control={control} render={({ field }) => (
                                        <Input {...field} className="!bg-white !text-slate-900 border-slate-300 focus:ring-purple-500" disabled={isSubmitting} />
                                    )} />
                                    {errors.tenSanPham && <p className="text-xs text-red-500">{errors.tenSanPham.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Mã sản phẩm</Label>
                                    <Controller name="maSanPham" control={control} render={({ field }) => (
                                        <Input {...field} className="!bg-white !text-slate-900 border-slate-300" disabled={isSubmitting} />
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Trạng thái</Label>
                                    <Controller name="trangThai" control={control} render={({ field }) => (
                                        <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                                            <SelectTrigger className="!bg-white !text-slate-900 border-slate-300"><SelectValue /></SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                sideOffset={4}
                                                className="!bg-white !text-slate-900 border-slate-200 shadow-xl">
                                                <SelectItem value="1" className="focus:bg-purple-50 focus:text-purple-700 cursor-pointer">Đang bán</SelectItem>
                                                <SelectItem value="0" className="focus:bg-purple-50 focus:text-purple-700 cursor-pointer">Ngừng bán</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Giá vốn mặc định</Label>
                                    <Controller name="giaVonMacDinh" control={control} render={({ field }) => (
                                        <Input {...field} type="number" className="!bg-white !text-slate-900 border-slate-300" />
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Giá bán mặc định *</Label>
                                    <Controller name="giaBanMacDinh" control={control} render={({ field }) => (
                                        <Input {...field} type="number" className="!bg-white !text-slate-900 border-slate-300" />
                                    )} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="!text-slate-900 font-semibold">Mô tả</Label>
                                    <Controller name="moTa" control={control} render={({ field }) => (
                                        <Textarea {...field} className="!bg-white !text-slate-900 border-slate-300" rows={2} />
                                    )} />
                                </div>
                            </div>
                        </div>

                        {/* 2. QUẢN LÝ ẢNH */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold !text-slate-800 border-l-4 border-purple-500 pl-2 uppercase tracking-tight">Hình ảnh sản phẩm</h3>
                            <div className="grid grid-cols-4 gap-3 p-4 border border-slate-200 rounded-xl !bg-slate-50/50">
                                {existingProductImages.map((img, index) => (
                                    <div key={`old-${index}`} className="relative aspect-square group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                        <img src={img.tepTin?.duongDan || img.urlAnh} className="w-full h-full object-cover" alt="product" />
                                        <button type="button" onClick={() => { setExistingProductImages(prev => prev.filter((_, i) => i !== index)); setProductImageUpdated(true); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                                    </div>
                                ))}
                                {productImages.map((file, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg border-2 border-purple-200 overflow-hidden bg-white shadow-sm">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new product" />
                                        <button type="button" onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                                    </div>
                                ))}
                                <label className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-purple-400 transition-all aspect-square text-slate-400 hover:text-purple-600">
                                    <Upload className="h-6 w-6" />
                                    <span className="text-[10px] mt-2 font-bold uppercase">Thêm ảnh</span>
                                    <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => { setProductImages(prev => [...prev, ...Array.from(e.target.files)]); setProductImageUpdated(true); }} />
                                </label>
                            </div>
                        </div>

                        {/* 3. BIẾN THỂ */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold !text-slate-800 border-l-4 border-purple-500 pl-2 uppercase tracking-tight flex items-center gap-2">
                                <Layers className="h-4 w-4 !text-slate-600" /> Danh sách biến thể
                            </h3>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border border-slate-200 rounded-xl p-4 !bg-white shadow-sm hover:shadow-md transition-shadow grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-2">
                                            <div className="relative aspect-square w-full group overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                {(variantImages[index] || existingVariantImages[index]) ? (
                                                    <img
                                                        src={variantImages[index] ? URL.createObjectURL(variantImages[index]) : (existingVariantImages[index].tepTin?.duongDan || existingVariantImages[index].urlAnh)}
                                                        className="w-full h-full object-cover"
                                                        alt="variant"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full"><Upload className="h-5 w-5 text-slate-300" /></div>
                                                )}
                                                <input type="file" id={`v-img-${index}`} className="hidden" onChange={(e) => setVariantImages(prev => ({ ...prev, [index]: e.target.files[0] }))} />
                                                <label htmlFor={`v-img-${index}`} className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">THAY ẢNH</label>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <p className="text-[11px] font-bold !text-purple-600 mb-1 uppercase tracking-wider">Mô tả biến thể</p>
                                            <div className="text-xs space-y-1 font-medium !text-slate-600">
                                                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>Màu:</span> <span className="!text-slate-900">{field.mauSac?.tenMau || 'Mặc định'}</span></div>
                                                <div className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>Size:</span> <span className="!text-slate-900">{field.size?.tenSize || 'Mặc định'}</span></div>
                                                <div className="flex justify-between"><span>Chất liệu:</span> <span className="!text-slate-900">{field.chatLieu?.tenChatLieu || 'Mặc định'}</span></div>
                                            </div>
                                        </div>

                                        <div className="col-span-7 grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold !text-slate-500 uppercase">Giá vốn</Label>
                                                <Controller name={`bienTheSanPhams.${index}.giaVon`} control={control} render={({ field }) => <Input {...field} type="number" className="h-8 !bg-white !text-slate-900 border-slate-200" />} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold !text-slate-500 uppercase">Giá bán</Label>
                                                <Controller name={`bienTheSanPhams.${index}.giaBan`} control={control} render={({ field }) => <Input {...field} type="number" className="h-8 !bg-white !text-slate-900 border-slate-200" />} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold !text-slate-500 uppercase">Trạng thái</Label>
                                                <Controller name={`bienTheSanPhams.${index}.trangThai`} control={control} render={({ field }) => (
                                                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className="h-8 !bg-white !text-slate-900 border-slate-200 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            sideOffset={4}
                                                            className="!bg-white !text-slate-900 border-slate-200 shadow-xl">
                                                            <SelectItem value="1" className="focus:bg-purple-50 focus:text-purple-700 text-xs cursor-pointer">Hoạt động</SelectItem>
                                                            <SelectItem value="0" className="focus:bg-purple-50 focus:text-purple-700 text-xs cursor-pointer">Tạm dừng</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t !bg-slate-50/80">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="!border-slate-300 !text-slate-700 hover:bg-slate-100">Hủy bỏ</Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 !text-white px-8 shadow-lg shadow-purple-200"
                        >
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "Cập nhật sản phẩm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}