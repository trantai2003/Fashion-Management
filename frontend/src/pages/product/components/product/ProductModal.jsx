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
import { Loader2, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import { productSchema } from "@/validations/productSchema";

export default function ProductModal({ isOpen, onClose, onSuccess, productId = null }) {
    const isEditMode = !!productId;

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [variantImages, setVariantImages] = useState([]);
    const [existingProductImages, setExistingProductImages] = useState([]);
    const [existingVariantImages, setExistingVariantImages] = useState([]);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const lightModeStyles = {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--muted': '210 40% 96.1%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '222.2 84% 4.9%',
        colorScheme: 'light',
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: {
            tenSanPham: "",
            maSanPham: "",
            maVach: "",
            danhMucId: 1,
            moTa: "",
            giaVonMacDinh: 0,
            giaBanMacDinh: 0,
            mucTonToiThieu: 0,
            trangThai: 1,
            bienTheSanPhams: [{
                mauSacId: null,
                sizeId: null,
                chatLieuId: null,
                maSku: "",
                maVachSku: "",
                giaVon: 0,
                giaBan: 0,
                trangThai: 1,
            }],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "bienTheSanPhams"
    });

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
                    bienTheSanPhams: product.bienTheSanPhams?.length > 0
                        ? product.bienTheSanPhams.map(variant => ({
                            id: variant.id,
                            mauSacId: variant.mauSac?.id ?? null,
                            sizeId: variant.size?.id ?? null,
                            chatLieuId: variant.chatLieu?.id ?? null,
                            maSku: variant.maSku || "",
                            maVachSku: variant.maVachSku || "",
                            giaVon: variant.giaVon || 0,
                            giaBan: variant.giaBan || 0,
                            trangThai: variant.trangThai ?? 1,
                        }))
                        : [{
                            mauSacId: null,
                            sizeId: null,
                            chatLieuId: null,
                            maSku: "",
                            maVachSku: "",
                            giaVon: 0,
                            giaBan: 0,
                            trangThai: 1,
                        }]
                });

                setExistingProductImages(product.anhQuanAos || []);
                setExistingVariantImages(product.anhBienThes || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            toast.error(error.response?.data?.message || "Không thể tải thông tin sản phẩm");
            onClose();
        } finally {
            setIsLoadingProduct(false);
        }
    }, [reset, onClose]);

    const handleResetForm = useCallback(() => {
        reset({
            tenSanPham: "",
            maSanPham: "",
            maVach: "",
            danhMucId: 1,
            moTa: "",
            giaVonMacDinh: 0,
            giaBanMacDinh: 0,
            mucTonToiThieu: 0,
            trangThai: 1,
            bienTheSanPhams: [{
                mauSacId: null,
                sizeId: null,
                chatLieuId: null,
                maSku: "",
                maVachSku: "",
                giaVon: 0,
                giaBan: 0,
                trangThai: 1,
            }],
        });
        setProductImages([]);
        setVariantImages([]);
        setExistingProductImages([]);
        setExistingVariantImages([]);
    }, [reset]);

    useEffect(() => {
        if (isOpen && isEditMode && productId) {
            fetchProductDetails(productId);
        }
    }, [isOpen, isEditMode, productId, fetchProductDetails]);

    useEffect(() => {
        if (isOpen && !isEditMode) {
            handleResetForm();
        }
    }, [isOpen, isEditMode, handleResetForm]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const extractData = (response) => response?.data?.data ?? response?.data ?? [];
                const [colorsResult, sizesResult, materialsResult] = await Promise.allSettled([
                    productService.getColors(),
                    productService.getSizes(),
                    productService.getMaterials(),
                ]);

                if (colorsResult.status === "fulfilled") setColors(extractData(colorsResult.value));
                if (sizesResult.status === "fulfilled") setSizes(extractData(sizesResult.value));
                if (materialsResult.status === "fulfilled") setMaterials(extractData(materialsResult.value));

                if (colorsResult.status === "rejected" || sizesResult.status === "rejected" || materialsResult.status === "rejected") {
                    toast.error("Không thể tải dữ liệu màu sắc, size, chất liệu");
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };

        fetchData();
    }, [isOpen]);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            const productData = {
                maVach: data.maVach || "",
                tenSanPham: data.tenSanPham,
                maSanPham: data.maSanPham || "",
                mucTonToiThieu: data.mucTonToiThieu,
                moTa: data.moTa || "",
                danhMucId: Number(data.danhMucId),
                giaVonMacDinh: Number(data.giaVonMacDinh),
                giaBanMacDinh: Number(data.giaBanMacDinh),
                trangThai: Number(data.trangThai),
                bienTheSanPhams: data.bienTheSanPhams.map(variant => ({
                    ...(variant.id && { id: variant.id }),
                    mauSacId: Number(variant.mauSacId),
                    sizeId: Number(variant.sizeId),
                    chatLieuId: Number(variant.chatLieuId),
                    maSku: variant.maSku,
                    maVachSku: variant.maVachSku || "",
                    giaVon: Number(variant.giaVon),
                    giaBan: Number(variant.giaBan),
                    trangThai: Number(variant.trangThai),
                })),
            };

            const dataKey = isEditMode ? 'updating' : 'creating';
            const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append(dataKey, jsonBlob);

            productImages.forEach((file) => formData.append('anhSanPhams', file));
            variantImages.forEach((file) => formData.append('anhBienThes', file));

            let res;
            if (isEditMode) {
                res = await productService.updateProduct(productId, formData);
            } else {
                res = await productService.createProduct(formData);
            }

            if (res?.data?.status >= 400) {
                toast.error(res.data.message || 'Có lỗi xảy ra');
                return;
            }

            toast.success(isEditMode ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!");
            handleResetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(`Lỗi khi xử lý sản phẩm:`, error);
            const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        }
    };


    const handleCancel = () => {
        if (!isSubmitting) {
            handleResetForm();
            onClose();
        }
    };

    const handleProductImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setProductImages(prev => [...prev, ...files]);
    };

    const handleRemoveProductImage = (index) => setProductImages(prev => prev.filter((_, i) => i !== index));
    const handleRemoveExistingProductImage = (index) => setExistingProductImages(prev => prev.filter((_, i) => i !== index));
    const handleVariantImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setVariantImages(prev => [...prev, ...files]);
    };
    const handleRemoveVariantImage = (index) => setVariantImages(prev => prev.filter((_, i) => i !== index));
    const handleRemoveExistingVariantImage = (index) => setExistingVariantImages(prev => prev.filter((_, i) => i !== index));

    if (isLoadingProduct) {
        return (
            <Dialog open={isOpen} onOpenChange={handleCancel}>
                <DialogContent style={lightModeStyles} className="sm:max-w-[900px] !bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Đang tải thông tin sản phẩm...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent style={lightModeStyles} className="sm:max-w-[900px] max-h-[90vh] !bg-white !text-slate-950 border border-gray-200 rounded-xl shadow-sm">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold !text-purple-700">
                        {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </DialogTitle>
                    <DialogDescription className="!text-slate-500">
                        {isEditMode
                            ? "Cập nhật thông tin sản phẩm và biến thể. Nhấn lưu khi hoàn tất."
                            : "Nhập đầy đủ thông tin sản phẩm và biến thể. Nhấn lưu khi hoàn tất."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(90vh-12rem)] overflow-y-auto overflow-x-visible px-1 light">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm !text-gray-700 border-b pb-2">Thông tin cơ bản</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="!text-slate-900" htmlFor="tenSanPham">Tên sản phẩm *</Label>
                                    <Controller
                                        name="tenSanPham"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} className="!bg-white !text-slate-900 !border-gray-300" placeholder="VD: Áo sơ mi nam cổ tròn" disabled={isSubmitting} />
                                        )}
                                    />
                                    {errors.tenSanPham && <p className="text-xs text-red-500">{errors.tenSanPham.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="!text-slate-900" htmlFor="maSanPham">Mã sản phẩm</Label>
                                    <Controller
                                        name="maSanPham"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} className="!bg-white !text-slate-900 !border-gray-300" placeholder="Mã sản phẩm" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="!text-slate-900" htmlFor="maVach">Mã vạch</Label>
                                    <Controller
                                        name="maVach"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} className="!bg-white !text-slate-900 !border-gray-300" placeholder="Mã vạch" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="!text-slate-900" htmlFor="trangThai">Trạng thái</Label>
                                    <Controller
                                        name="trangThai"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="!bg-white !text-slate-900 !border-gray-300">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="!bg-white !text-slate-900">
                                                    <SelectItem value="1">Đang bán</SelectItem>
                                                    <SelectItem value="0">Ngừng bán</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="!text-slate-900" htmlFor="giaVonMacDinh">Giá vốn mặc định</Label>
                                    <Controller
                                        name="giaVonMacDinh"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" className="!bg-white !text-slate-900 !border-gray-300" min="0" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="!text-slate-900" htmlFor="giaBanMacDinh">Giá bán mặc định *</Label>
                                    <Controller
                                        name="giaBanMacDinh"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" className="!bg-white !text-slate-900 !border-gray-300" min="0" disabled={isSubmitting} />
                                        )}
                                    />
                                    {errors.giaBanMacDinh && <p className="text-xs text-red-500">{errors.giaBanMacDinh.message}</p>}
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label className="!text-slate-900" htmlFor="mucTonToiThieu">Mức tồn tối thiểu</Label>
                                    <Controller
                                        name="mucTonToiThieu"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" className="!bg-white !text-slate-900 !border-gray-300" min="0" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label className="!text-slate-900" htmlFor="moTa">Mô tả</Label>
                                    <Controller
                                        name="moTa"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea {...field} className="!bg-white !text-slate-900 !border-gray-300" placeholder="Nhập mô tả..." rows={3} disabled={isSubmitting} />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 overflow-visible">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-sm !text-gray-700">Biến thể sản phẩm <span className="text-red-500">*</span></h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => append({ mauSacId: null, sizeId: null, chatLieuId: null, maSku: "", maVachSku: "", giaVon: 0, giaBan: 0, trangThai: 1 })}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-1 !border-gray-300 !text-slate-900 hover:!bg-gray-100"
                                >
                                    <Plus className="h-4 w-4" /> Thêm biến thể
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 !bg-gray-50 relative overflow-visible !border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium !text-slate-900">Biến thể #{index + 1}</span>
                                        {fields.length > 1 && (
                                            <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)} disabled={isSubmitting} className="hover:bg-red-50 text-red-500">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label className="!text-slate-900">Màu sắc *</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.mauSacId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))} disabled={isSubmitting}>
                                                        <SelectTrigger className="!bg-white !text-slate-900 !border-gray-300"><SelectValue placeholder="Chọn màu" /></SelectTrigger>
                                                        <SelectContent className="!bg-white !text-slate-900">
                                                            {colors.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.tenMau}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="!text-slate-900">Size *</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.sizeId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))} disabled={isSubmitting}>
                                                        <SelectTrigger className="!bg-white !text-slate-900 !border-gray-300"><SelectValue placeholder="Chọn size" /></SelectTrigger>
                                                        <SelectContent className="!bg-white !text-slate-900">
                                                            {sizes.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.tenSize}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="!text-slate-900">Chất liệu *</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.chatLieuId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))} disabled={isSubmitting}>
                                                        <SelectTrigger className="!bg-white !text-slate-900 !border-gray-300"><SelectValue placeholder="Chọn chất liệu" /></SelectTrigger>
                                                        <SelectContent className="!bg-white !text-slate-900">
                                                            {materials.map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.tenChatLieu}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label className="!text-slate-900">Mã SKU *</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.maSku`}
                                                control={control}
                                                render={({ field }) => <Input {...field} className="!bg-white !text-slate-900 !border-gray-300" disabled={isSubmitting} />}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="!text-slate-900">Giá bán *</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.giaBan`}
                                                control={control}
                                                render={({ field }) => <Input {...field} type="number" className="!bg-white !text-slate-900 !border-gray-300" disabled={isSubmitting} />}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="!text-slate-900">Ảnh sản phẩm</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 space-y-2 !border-gray-300">
                                    <input type="file" multiple accept="image/*" onChange={handleProductImagesChange} className="hidden" id="modal-product-images" />
                                    <label htmlFor="modal-product-images" className="flex items-center justify-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 !text-slate-900 !border-gray-300">
                                        <Upload className="h-4 w-4" /> <span className="text-sm">Chọn ảnh</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {productImages.map((file, i) => (
                                            <div key={i} className="relative">
                                                <img src={URL.createObjectURL(file)} className="w-full h-20 object-cover rounded" />
                                                <button type="button" onClick={() => handleRemoveProductImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="!bg-white border-t pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="!border-gray-300 !text-slate-900">Hủy</Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-700 !text-white"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin !text-white" /><span className="!text-white">Đang xử lý...</span></>
                        ) : (
                            <span className="!text-white">{isEditMode ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}