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
import { Loader2, Upload, X, Plus, Info, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import { danhMucQuanAoService } from "@/services/danhMucQuanAoService.js";
import * as yup from "yup";

const addProductSchema = yup.object({
    tenSanPham: yup.string().required("Tên sản phẩm là bắt buộc"),
    maSanPham: yup.string().nullable(),
    maVach: yup.string(),
    danhMucId: yup.number().required("Danh mục là bắt buộc").typeError("Vui lòng chọn danh mục"),
    moTa: yup.string(),
    giaVonMacDinh: yup.number().transform(value => (isNaN(value) ? 0 : value)).nullable(),
    giaBanMacDinh: yup.number().transform(value => (isNaN(value) ? 0 : value)).nullable(),
    mucTonToiThieu: yup.number().min(0, "Mức tồn phải >= 0"),
    trangThai: yup.number().required(),
    bienTheSanPhams: yup.array().of(
        yup.object({
            mauSacId: yup.number().required("Màu sắc là bắt buộc").nullable(),
            sizeId: yup.number().required("Size là bắt buộc").nullable(),
            chatLieuId: yup.number().required("Chất liệu là bắt buộc").nullable(),
            maSku: yup.string().nullable(),
            maVachSku: yup.string(),
            giaVon: yup.number().transform(value => (isNaN(value) ? 0 : value)).nullable(),
            giaBan: yup.number().transform(value => (isNaN(value) ? 0 : value)).nullable(),
            trangThai: yup.number().required(),
        })
    ).min(1, "Phải có ít nhất 1 biến thể")
});

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [variantImages, setVariantImages] = useState({});

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch
    } = useForm({
        resolver: yupResolver(addProductSchema),
        defaultValues: {
            tenSanPham: "",
            maSanPham: "",
            maVach: "",
            danhMucId: "",
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

    const handleResetForm = useCallback(() => {
        reset({
            tenSanPham: "",
            maSanPham: "",
            maVach: "",
            danhMucId: "",
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
        setVariantImages({});
    }, [reset]);

    useEffect(() => {
        if (isOpen) {
            handleResetForm();
        }
    }, [isOpen, handleResetForm]);

    // ==========================================
    // LOGIC LÀM PHẲNG CÂY DANH MỤC (LỌC TRẠNG THÁI & TẠO CÂY THỤT LỀ)
    // ==========================================
    const flattenCategoryTree = (tree, level = 0) => {
        let flatList = [];
        if (!Array.isArray(tree)) return flatList;

        tree.forEach(node => {
            // CHỈ LẤY DANH MỤC CÓ TRẠNG THÁI BẰNG 1
            if (node.trangThai === 1) {
                // Tạo chuỗi thụt lề bằng Non-breaking space (\u00A0) để React/HTML không cắt mất
                const indent = "\u00A0\u00A0\u00A0\u00A0".repeat(level);
                const prefix = level > 0 ? `${indent}└─ ` : "";

                flatList.push({
                    id: node.id,
                    tenDanhMuc: node.tenDanhMuc, // Tên gốc (dùng khi cần)
                    displayTitle: `${prefix}${node.tenDanhMuc}`, // Tên hiển thị trong Dropdown có nhánh cây
                    level: level
                });
                
                // Xử lý mảng danh mục con dựa theo DTO là "danhMucCons"
                if (node.danhMucCons && Array.isArray(node.danhMucCons) && node.danhMucCons.length > 0) {
                    flatList = flatList.concat(flattenCategoryTree(node.danhMucCons, level + 1));
                }
            }
        });
        return flatList;
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const extractData = (response) => response?.data?.data ?? response?.data ?? [];
                
                const [colorsResult, sizesResult, materialsResult, categoriesResult] = await Promise.allSettled([
                    productService.getColors(),
                    productService.getSizes(),
                    productService.getMaterials(),
                    danhMucQuanAoService.getCayDanhMuc(),
                ]);

                if (colorsResult.status === "fulfilled") setColors(extractData(colorsResult.value));
                if (sizesResult.status === "fulfilled") setSizes(extractData(sizesResult.value));
                if (materialsResult.status === "fulfilled") setMaterials(extractData(materialsResult.value));

                if (categoriesResult.status === "fulfilled") {
                    const rawCategoriesTree = extractData(categoriesResult.value);
                    // Ép phẳng cây danh mục và tạo lùi lề
                    setCategories(flattenCategoryTree(rawCategoriesTree)); 
                } else {
                    toast.error("Không thể tải dữ liệu danh mục");
                }

            } catch (error) {
                toast.error("Lỗi hệ thống khi tải dữ liệu khởi tạo");
            }
        };

        fetchData();
    }, [isOpen]);

    const onSubmit = async (data) => {
        if (productImages.length === 0) {
            toast.error("Vui lòng thêm ít nhất một ảnh sản phẩm chính");
            return;
        }

        for (let i = 0; i < data.bienTheSanPhams.length; i++) {
            if (!variantImages[i]) {
                toast.error(`Vui lòng thêm ảnh cho biến thể #${i + 1}`);
                return;
            }
        }

        try {
            const formData = new FormData();

            const productData = {
                maVach: data.maVach || "",
                tenSanPham: data.tenSanPham,
                maSanPham: data.maSanPham || "",
                mucTonToiThieu: data.mucTonToiThieu,
                moTa: data.moTa || "",
                danhMucId: Number(data.danhMucId),
                giaVonMacDinh: Number(data.giaVonMacDinh) || 0,
                giaBanMacDinh: Number(data.giaBanMacDinh) || 0,
                trangThai: Number(data.trangThai),
                bienTheSanPhams: data.bienTheSanPhams.map(variant => ({
                    mauSacId: Number(variant.mauSacId),
                    sizeId: Number(variant.sizeId),
                    chatLieuId: Number(variant.chatLieuId),
                    maSku: variant.maSku || "",
                    maVachSku: variant.maVachSku || "",
                    giaVon: Number(variant.giaVon) || 0,
                    giaBan: Number(variant.giaBan) || 0,
                    trangThai: Number(variant.trangThai),
                })),
            };

            const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append('creating', jsonBlob);

            productImages.forEach((file) => {
                formData.append('anhSanPhams', file);
            });

            data.bienTheSanPhams.forEach((_, index) => {
                if (variantImages[index]) {
                    formData.append('anhBienThes', variantImages[index]);
                } else {
                    formData.append('anhBienThes', new File([], "empty.txt"));
                }
            });

            const res = await productService.createProduct(formData);

            if (res?.data?.status >= 400) {
                toast.error(res.data.message || 'Có lỗi xảy ra');
                return;
            }

            toast.success("Tạo sản phẩm thành công!");
            handleResetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Lỗi khi tạo sản phẩm:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo sản phẩm';
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

    const handleRemoveProductImage = (index) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantImageChange = (variantIndex, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVariantImages(prev => ({
                ...prev,
                [variantIndex]: file
            }));
        }
    };

    const handleRemoveVariantImage = (variantIndex) => {
        setVariantImages(prev => {
            const updated = { ...prev };
            delete updated[variantIndex];
            return updated;
        });
    };

    const handleRemoveVariant = (index) => {
        remove(index);
        setVariantImages(prev => {
            const updated = {};
            Object.keys(prev).forEach(key => {
                const numKey = Number(key);
                if (numKey < index) {
                    updated[numKey] = prev[key];
                } else if (numKey > index) {
                    updated[numKey - 1] = prev[key];
                }
            });
            return updated;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[1180px] max-h-[92vh] bg-white dark:!bg-white text-amber-950 dark:!text-amber-950 border border-amber-200 rounded-2xl shadow-xl flex flex-col">
                <DialogHeader className="border-b border-amber-200 pb-4">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-amber-950">
                            <Package className="w-5 h-5 text-amber-700" />
                            Thêm sản phẩm mới
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-amber-800/80">
                        Điền thông tin theo từng nhóm để tạo sản phẩm mới đầy đủ và dễ kiểm soát hơn.
                    </DialogDescription>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] font-semibold">
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 1: Thông tin</div>
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 2: Ảnh sản phẩm</div>
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 3: Biến thể</div>
                    </div>

                    <div className="grid gap-2 lg:grid-cols-2 mt-2">
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-amber-700 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <b>Tự động sinh mã:</b> Mã sản phẩm và SKU sẽ được hệ thống tạo từ danh mục và thuộc tính biến thể.
                            </p>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                            <Info className="h-4 w-4 text-amber-700 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <b>Lưu ý giá:</b> Có thể để trống giá khi tạo, hệ thống sẽ cập nhật theo dữ liệu nhập kho thực tế.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto overflow-x-visible px-1 min-h-0">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6 py-1 [&_[data-slot=input]]:bg-white [&_[data-slot=input]]:text-amber-950 [&_[data-slot=textarea]]:bg-white [&_[data-slot=textarea]]:text-amber-950 [&_[data-slot=select-trigger]]:bg-white [&_[data-slot=select-trigger]]:text-amber-950 [&_[data-slot=select-content]]:bg-white [&_[data-slot=select-content]]:text-amber-950 dark:[&_[data-slot=input]]:bg-white dark:[&_[data-slot=textarea]]:bg-white dark:[&_[data-slot=select-trigger]]:bg-white dark:[&_[data-slot=select-content]]:bg-white"
                    >
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] items-start">
                            <div className="space-y-4">
                                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                            <h3 className="font-semibold text-sm text-amber-900 border-b border-amber-200 pb-2">Thông tin cơ bản</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Tên sản phẩm */}
                                <div className="space-y-2">
                                    <Label htmlFor="tenSanPham">
                                        Tên sản phẩm <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="tenSanPham"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} placeholder="VD: Áo sơ mi nam cổ tròn" disabled={isSubmitting} />
                                        )}
                                    />
                                    {errors.tenSanPham && (
                                        <p className="text-xs text-red-500">{errors.tenSanPham.message}</p>
                                    )}
                                </div>

                                {/* Danh mục sản phẩm - TRẢ LẠI CẤU TRÚC CHA CON */}
                                <div className="space-y-2">
                                    <Label htmlFor="danhMucId">Danh mục <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="danhMucId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="w-full h-10 bg-white">
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    position="popper"
                                                    side="bottom"
                                                    align="start"
                                                    className="z-50 bg-white border border-gray-200 shadow-lg rounded-md max-h-[300px]"
                                                >
                                                    {categories.length === 0 ? (
                                                        <div className="p-2 text-sm text-gray-500 text-center">Không có danh mục nào đang hoạt động</div>
                                                    ) : (
                                                        categories.map((cat) => (
                                                            <SelectItem 
                                                                key={cat.id} 
                                                                value={cat.id.toString()}
                                                                className={`cursor-pointer ${cat.level === 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}
                                                            >
                                                                {cat.displayTitle}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.danhMucId && (
                                        <p className="text-xs text-red-500">{errors.danhMucId.message}</p>
                                    )}
                                </div>

                                {/* Mã sản phẩm (Tự động) */}
                                <div className="space-y-2">
                                    <Label htmlFor="maSanPham" className="text-gray-500">Mã sản phẩm (Tự động)</Label>
                                    <Controller
                                        name="maSanPham"
                                        control={control}
                                        render={({ field }) => (
                                            <Input 
                                                {...field} 
                                                placeholder="Hệ thống tự động sinh mã..." 
                                                disabled 
                                                className="bg-gray-50 italic text-gray-500 cursor-not-allowed" 
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maVach">Mã vạch</Label>
                                    <Controller
                                        name="maVach"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} placeholder="Mã vạch (Nếu có)" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trangThai">Trạng thái mặc định</Label>
                                    <Controller
                                        name="trangThai"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" side="bottom" className="z-50 bg-white border border-gray-200 shadow-lg rounded-md">
                                                    <SelectItem value="1">Còn hàng</SelectItem>
                                                    <SelectItem value="0">Hết hàng</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="mucTonToiThieu">Mức tồn tối thiểu</Label>
                                    <Controller
                                        name="mucTonToiThieu"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" min="0" placeholder="0" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="giaVonMacDinh">Giá vốn mặc định</Label>
                                    <Controller
                                        name="giaVonMacDinh"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" min="0" placeholder="0 (Tự động cập nhật)" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="giaBanMacDinh">Giá bán mặc định</Label>
                                    <Controller
                                        name="giaBanMacDinh"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" min="0" placeholder="0 (Tự động cập nhật)" disabled={isSubmitting} />
                                        )}
                                    />
                                </div>

                                {/* Mô tả */}
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="moTa">Mô tả</Label>
                                    <Controller
                                        name="moTa"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea {...field} placeholder="Nhập mô tả chi tiết về sản phẩm..." rows={3} disabled={isSubmitting} />
                                        )}
                                    />
                                </div>
                                    </div>
                                </div>

                                {/* Ảnh sản phẩm - Required */}
                                <div className="space-y-4 rounded-2xl border border-amber-200 bg-white p-4">
                                    <h3 className="font-semibold text-sm text-amber-900 border-b border-amber-200 pb-2">
                                        Ảnh sản phẩm chính <span className="text-red-500">*</span>
                                    </h3>
                                    <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 space-y-2 bg-amber-50/40">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleProductImagesChange}
                                            className="hidden"
                                            id="product-images"
                                            disabled={isSubmitting}
                                        />
                                        <label
                                            htmlFor="product-images"
                                            className="flex items-center justify-center gap-2 p-2 border border-amber-300 rounded-xl cursor-pointer hover:bg-amber-100 text-amber-900"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span className="text-sm">Chọn ảnh sản phẩm</span>
                                        </label>
                                        {productImages.length === 0 && (
                                            <p className="text-xs text-gray-500 text-center">Vui lòng thêm ít nhất 1 ảnh sản phẩm chính</p>
                                        )}
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {productImages.map((file, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="Preview"
                                                        className="w-full h-24 object-cover rounded-lg border shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProductImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Biến thể sản phẩm */}
                            <div className="space-y-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-4 xl:sticky xl:top-0">
                            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                                <h3 className="font-semibold text-sm text-amber-900">
                                    Danh sách biến thể <span className="text-red-500">*</span>
                                </h3>
                                <span className="text-[11px] text-amber-700">Cuộn để xem thêm</span>
                            </div>

                            <div className="max-h-[55vh] xl:max-h-[calc(92vh-25rem)] overflow-y-auto pr-1 space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-amber-200 rounded-xl space-y-3 bg-white relative overflow-visible shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-amber-900">Biến thể #{index + 1}</span>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveVariant(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Xóa
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 overflow-visible">
                                        {/* Màu sắc */}
                                        <div className="space-y-2">
                                            <Label>Màu sắc <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.mauSacId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value === "" || field.value === null || field.value === undefined ? undefined : field.value.toString()}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Chọn màu" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" side="bottom" align="start" className="z-50 bg-white max-h-[200px]">
                                                            {colors.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có màu sắc</div>
                                                            ) : (
                                                                colors.map((color) => (
                                                                    <SelectItem key={`color-${index}-${color.id}`} value={color.id.toString()}>{color.tenMau}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.bienTheSanPhams?.[index]?.mauSacId && (
                                                <p className="text-xs text-red-500">{errors.bienTheSanPhams[index].mauSacId.message}</p>
                                            )}
                                        </div>

                                        {/* Size */}
                                        <div className="space-y-2">
                                            <Label>Size <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.sizeId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value === "" || field.value === null || field.value === undefined ? undefined : field.value.toString()}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Chọn size" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" side="bottom" align="start" className="z-50 bg-white max-h-[200px]">
                                                            {sizes.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có size</div>
                                                            ) : (
                                                                sizes.map((size) => (
                                                                    <SelectItem key={`size-${index}-${size.id}`} value={size.id.toString()}>{size.tenSize}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.bienTheSanPhams?.[index]?.sizeId && (
                                                <p className="text-xs text-red-500">{errors.bienTheSanPhams[index].sizeId.message}</p>
                                            )}
                                        </div>

                                        {/* Chất liệu */}
                                        <div className="space-y-2">
                                            <Label>Chất liệu <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.chatLieuId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value === "" || field.value === null || field.value === undefined ? undefined : field.value.toString()}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Chọn chất liệu" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" side="bottom" align="start" className="z-50 bg-white max-h-[200px]">
                                                            {materials.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có chất liệu</div>
                                                            ) : (
                                                                materials.map((material) => (
                                                                    <SelectItem key={`material-${index}-${material.id}`} value={material.id.toString()}>{material.tenChatLieu}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.bienTheSanPhams?.[index]?.chatLieuId && (
                                                <p className="text-xs text-red-500">{errors.bienTheSanPhams[index].chatLieuId.message}</p>
                                            )}
                                        </div>

                                        {/* Mã SKU */}
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-gray-500">Mã SKU (Tự động)</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.maSku`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Hệ thống tự động ghép mã..." disabled className="bg-gray-100 italic text-gray-500 cursor-not-allowed" />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Mã vạch SKU</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.maVachSku`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Mã vạch SKU" className="bg-white" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Giá vốn</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.giaVon`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" min="0" placeholder="0 (Tự động)" className="bg-white" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Giá bán</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.giaBan`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" min="0" placeholder="0 (Tự động)" className="bg-white" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Trạng thái</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.trangThai`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Chọn trạng thái" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" side="bottom" className="z-50 bg-white">
                                                            <SelectItem value="1">Hoạt động</SelectItem>
                                                            <SelectItem value="0">Tạm ngừng</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Image */}
                                    <div className="space-y-2 mt-4 pt-4 border-t">
                                        <Label>Ảnh biến thể <span className="text-red-500">*</span></Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 border-2 border-dashed border-amber-300 rounded-lg p-2 bg-white">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleVariantImageChange(index, e)}
                                                    className="hidden"
                                                    id={`variant-image-${index}`}
                                                    disabled={isSubmitting}
                                                />
                                                <label
                                                    htmlFor={`variant-image-${index}`}
                                                    className="flex items-center justify-center gap-2 p-2 border border-amber-300 rounded-lg cursor-pointer hover:bg-amber-100 h-full text-amber-900"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    <span className="text-sm">Chọn ảnh biến thể</span>
                                                </label>
                                            </div>
                                            
                                            <div className="w-24 h-24 shrink-0 flex items-center justify-center border rounded-lg bg-white overflow-hidden relative">
                                                {!variantImages[index] ? (
                                                    <p className="text-[10px] text-gray-400 text-center px-1">Chưa có ảnh</p>
                                                ) : (
                                                    <>
                                                        <img
                                                            src={URL.createObjectURL(variantImages[index])}
                                                            alt="Variant Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariantImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-4 border-t border-amber-200 pt-4 bg-white dark:!bg-white shrink-0">
                    <div className="w-full flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => append({
                                mauSacId: null,
                                sizeId: null,
                                chatLieuId: null,
                                maSku: "",
                                maVachSku: "",
                                giaVon: 0,
                                giaBan: 0,
                                trangThai: 1,
                            })}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 border-dashed border-2 border-amber-300 hover:bg-amber-100 text-amber-900"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm biến thể khác
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="bg-white text-amber-900 border-amber-300 hover:bg-amber-50 h-10 px-6 rounded-xl font-medium"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-amber-600 text-white border border-amber-600 hover:bg-amber-700 shadow-sm transition-all duration-200 h-10 px-6 rounded-xl font-medium flex items-center"
                                onClick={handleSubmit(onSubmit)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    "Lưu sản phẩm"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}