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
import { Loader2, Upload, X, Package, Info } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import * as yup from "yup";

const PRODUCT_STATUS_LABELS = {
    1: "Còn hàng",
    0: "Hết hàng",
    2: "Ngừng hoạt động",
};

const editProductSchema = yup.object({
    tenSanPham: yup.string().required("Tên sản phẩm là bắt buộc"),
    maSanPham: yup.string(),
    maVach: yup.string(),
    danhMucId: yup.number().required("Danh mục là bắt buộc"),
    moTa: yup.string(),
    giaVonMacDinh: yup.number().min(0, "Giá vốn phải >= 0").required("Giá vốn là bắt buộc"),
    giaBanMacDinh: yup.number().min(0, "Giá bán phải >= 0").required("Giá bán là bắt buộc"),
    mucTonToiThieu: yup.number().min(0, "Mức tồn phải >= 0"),
    trangThai: yup.number().required(),
    bienTheSanPhams: yup.array().of(
        yup.object({
            id: yup.number().required(),
            giaVon: yup.number().min(0, "Giá vốn phải >= 0").required("Giá vốn là bắt buộc"),
            giaBan: yup.number().min(0, "Giá bán phải >= 0").required("Giá bán là bắt buộc"),
            trangThai: yup.number().required(),
        })
    ).min(1, "Phải có ít nhất 1 biến thể")
});

export default function EditProductModal({ isOpen, onClose, onSuccess, productId }) {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [existingProductImages, setExistingProductImages] = useState([]);
    const [variantImages, setVariantImages] = useState({});
    const [existingVariantImages, setExistingVariantImages] = useState({});
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [productImageUpdated, setProductImageUpdated] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch
    } = useForm({
        resolver: yupResolver(editProductSchema),
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
            bienTheSanPhams: [],
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "bienTheSanPhams"
    });

    const bienTheSanPhams = watch("bienTheSanPhams");

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
                            giaVon: variant.giaVon || 0,
                            giaBan: variant.giaBan || 0,
                            trangThai: variant.trangThai ?? 1,
                        }))
                        : []
                });

                setExistingProductImages(product.anhQuanAos || []);
                
                // Map variant images by variant ID for easier access
                const variantImageMap = {};
                if (product.bienTheSanPhams) {
                    product.bienTheSanPhams.forEach((variant, index) => {
                        if (variant.anhBienThe) {
                            variantImageMap[index] = variant.anhBienThe;
                        }
                    });
                }
                setExistingVariantImages(variantImageMap);
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
            bienTheSanPhams: [],
        });
        setProductImages([]);
        setExistingProductImages([]);
        setVariantImages({});
        setExistingVariantImages({});
        setProductImageUpdated(false);
    }, [reset]);

    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetails(productId);
        }
    }, [isOpen, productId, fetchProductDetails]);

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

                if (colorsResult.status === "fulfilled") {
                    setColors(extractData(colorsResult.value));
                } else {
                    console.error("Lỗi tải màu sắc:", colorsResult.reason);
                }

                if (sizesResult.status === "fulfilled") {
                    const sizeData = extractData(sizesResult.value);
                    setSizes(sizeData);
                } else {
                    console.error("Lỗi tải size:", sizesResult.reason);
                }

                if (materialsResult.status === "fulfilled") {
                    setMaterials(extractData(materialsResult.value));
                } else {
                    console.error("Lỗi tải chất liệu:", materialsResult.reason);
                }

                if (
                    colorsResult.status === "rejected" ||
                    sizesResult.status === "rejected" ||
                    materialsResult.status === "rejected"
                ) {
                    toast.error("Không thể tải dữ liệu màu sắc, size, chất liệu");
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu màu sắc, size, chất liệu:", error);
                toast.error("Không thể tải dữ liệu màu sắc, size, chất liệu");
            }
        };

        fetchData();
    }, [isOpen]);

    // Helper function to create an empty file
    const createEmptyFile = () => {
        return new File([], 'empty.txt', { type: 'text/plain' });
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            const productData = {
                id: productId,
                maVach: data.maVach || "",
                tenSanPham: data.tenSanPham,
                maSanPham: data.maSanPham || "",
                mucTonToiThieu: data.mucTonToiThieu,
                moTa: data.moTa || "",
                danhMucId: Number(data.danhMucId),
                giaVonMacDinh: Number(data.giaVonMacDinh),
                giaBanMacDinh: Number(data.giaBanMacDinh),
                trangThai: Number(data.trangThai),
                imageUpdated: productImageUpdated,
                bienTheSanPhams: data.bienTheSanPhams.map((variant, index) => ({
                    id: variant.id,
                    giaVon: Number(variant.giaVon),
                    giaBan: Number(variant.giaBan),
                    trangThai: Number(variant.trangThai),
                    imageUpdated: !!variantImages[index], // Check if this variant has a new image
                })),
            };

            const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append('updating', jsonBlob);

            // Append product images if updated
            if (productImageUpdated) {
                // Fetch ảnh cũ còn giữ lại thành File rồi gộp với ảnh mới
                const existingImageFiles = await Promise.all(
                    existingProductImages.map(async (img) => {
                        const url = img.tepTin?.duongDan || img.urlAnh;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const fileName = url.split('/').pop() || 'existing_image.jpg';
                        return new File([blob], fileName, { type: blob.type });
                    })
                );

                // Gửi ảnh cũ trước, ảnh mới sau
                existingImageFiles.forEach((file) => {
                    formData.append('anhSanPhams', file);
                });
                productImages.forEach((file) => {
                    formData.append('anhSanPhams', file);
                });
            }

            // Append variant images in order - send empty file for variants without updates
            data.bienTheSanPhams.forEach((_, index) => {
                if (variantImages[index]) {
                    // Has new image - append the actual file
                    formData.append('anhBienThes', variantImages[index]);
                } else {
                    // No new image - append empty file to maintain order
                    formData.append('anhBienThes', createEmptyFile());
                }
            });

            const res = await productService.updateProduct(productId, formData);

            if (res?.data?.status >= 400) {
                toast.error(res.data.message || 'Có lỗi xảy ra');
                return;
            }

            toast.success("Cập nhật sản phẩm thành công!");
            handleResetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);

            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm';
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
        setProductImageUpdated(true);
    };

    const handleRemoveProductImage = (index) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingProductImage = (index) => {
        setExistingProductImages(prev => prev.filter((_, i) => i !== index));
        setProductImageUpdated(true);
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

    const handleRemoveExistingVariantImage = (variantIndex) => {
        setExistingVariantImages(prev => {
            const updated = { ...prev };
            delete updated[variantIndex];
            return updated;
        });
    };

    if (isLoadingProduct) {
        return (
            <Dialog open={isOpen} onOpenChange={handleCancel}>
                <DialogContent className="sm:max-w-[1180px] max-h-[92vh] bg-white dark:!bg-white text-amber-950 dark:!text-amber-950 border border-amber-200 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
                        <span className="ml-3 text-amber-800">Đang tải thông tin sản phẩm...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[1180px] max-h-[92vh] bg-white dark:!bg-white text-amber-950 dark:!text-amber-950 border border-amber-200 rounded-2xl shadow-xl flex flex-col">
                <DialogHeader className="border-b border-amber-200 pb-4">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-amber-950">
                            <Package className="w-5 h-5 text-amber-700" />
                            Chỉnh sửa sản phẩm
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-amber-800/80">
                        Chỉnh sửa theo từng nhóm thông tin để kiểm tra nhanh sản phẩm, ảnh và biến thể.
                    </DialogDescription>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] font-semibold">
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 1: Soát thông tin</div>
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 2: Cập nhật ảnh</div>
                        <div className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 text-center">Bước 3: Lưu thay đổi</div>
                    </div>
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                        <Info className="h-4 w-4 text-amber-700 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Chỉ thay đổi giao diện hiển thị để dễ thao tác hơn, dữ liệu và quy trình lưu giữ nguyên như hiện tại.
                        </p>
                    </div>
                </DialogHeader>

                <div className="max-h-[calc(92vh-14rem)] overflow-y-auto overflow-x-visible px-1">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6 py-1 [&_[data-slot=input]]:bg-white [&_[data-slot=input]]:text-amber-950 [&_[data-slot=textarea]]:bg-white [&_[data-slot=textarea]]:text-amber-950 [&_[data-slot=select-trigger]]:bg-white [&_[data-slot=select-trigger]]:text-amber-950 [&_[data-slot=select-content]]:bg-white [&_[data-slot=select-content]]:text-amber-950 dark:[&_[data-slot=input]]:bg-white dark:[&_[data-slot=textarea]]:bg-white dark:[&_[data-slot=select-trigger]]:bg-white dark:[&_[data-slot=select-content]]:bg-white"
                    >
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] items-start">
                            <div className="space-y-4">
                                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                                    <h3 className="font-semibold text-sm text-amber-900 border-b border-amber-200 pb-2">Thông tin cơ bản</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2">
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

                                        <div className="space-y-2">
                                            <Label htmlFor="maSanPham">Mã sản phẩm</Label>
                                            <Controller
                                                name="maSanPham"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Mã sản phẩm" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maVach">Mã vạch</Label>
                                            <Controller
                                                name="maVach"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Mã vạch" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        <Controller
                                            name="danhMucId"
                                            control={control}
                                            render={({ field }) => (
                                                <input type="hidden" {...field} value={1} />
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <Label htmlFor="trangThai">Trạng thái</Label>
                                            <Controller
                                                name="trangThai"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 bg-amber-100">
                                                        <span className="text-sm text-amber-900 font-medium">
                                                            {PRODUCT_STATUS_LABELS[field.value] ?? "-"}
                                                        </span>
                                                        <input type="hidden" value={field.value ?? 1} readOnly {...field} />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="giaVonMacDinh">Giá vốn mặc định</Label>
                                            <Controller
                                                name="giaVonMacDinh"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="giaBanMacDinh">
                                                Giá bán mặc định <span className="text-red-500">*</span>
                                            </Label>
                                            <Controller
                                                name="giaBanMacDinh"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                            {errors.giaBanMacDinh && (
                                                <p className="text-xs text-red-500">{errors.giaBanMacDinh.message}</p>
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="mucTonToiThieu">Mức tồn tối thiểu</Label>
                                            <Controller
                                                name="mucTonToiThieu"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="moTa">Mô tả</Label>
                                            <Controller
                                                name="moTa"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                                        rows={3}
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-amber-200 bg-white p-4">
                                    <h3 className="font-semibold text-sm text-amber-900 border-b border-amber-200 pb-2">Ảnh sản phẩm</h3>
                                    <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 space-y-2 bg-amber-50/40">
                                        {existingProductImages.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại:</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {existingProductImages.map((img, index) => (
                                                        <div key={`existing-${index}`} className="relative">
                                                            <img
                                                                src={img.tepTin?.duongDan || img.urlAnh}
                                                                alt="Product"
                                                                className="w-full h-20 object-cover rounded"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExistingProductImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                                            <span className="text-sm">Thêm ảnh mới</span>
                                        </label>
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                            {productImages.map((file, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="Preview"
                                                        className="w-full h-20 object-cover rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProductImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 overflow-visible rounded-2xl border border-amber-200 bg-amber-50/70 p-4 xl:sticky xl:top-0">
                            <div className="border-b border-amber-200 pb-2">
                                <h3 className="font-semibold text-sm text-amber-900">
                                    Biến thể sản phẩm
                                </h3>
                                <p className="text-xs text-amber-800/80 mt-1">Chỉ có thể cập nhật giá và trạng thái của biến thể</p>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-amber-200 rounded-xl space-y-3 bg-white relative overflow-visible shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-amber-900">Biến thể #{index + 1}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Giá vốn */}
                                        <div className="space-y-2">
                                            <Label>Giá vốn <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.giaVon`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Giá bán */}
                                        <div className="space-y-2">
                                            <Label>Giá bán <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.giaBan`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Trạng thái */}
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
                                                        <SelectTrigger className="w-full h-10">
                                                            <SelectValue placeholder="Chọn trạng thái" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={4}
                                                            className="z-50 bg-white border border-gray-200 shadow-lg rounded-md"
                                                        >
                                                            <SelectItem value="1">Hoạt động</SelectItem>
                                                            <SelectItem value="0">Tạm ngừng</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Image */}
                                    <div className="space-y-2">
                                        <Label>Ảnh biến thể</Label>
                                        <div className="border-2 border-dashed border-amber-300 rounded-lg p-3 space-y-2 bg-amber-50/40">
                                            {/* Existing variant image */}
                                            {existingVariantImages[index] && !variantImages[index] && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại:</p>
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={existingVariantImages[index].tepTin?.duongDan || existingVariantImages[index].urlAnh}
                                                            alt="Variant"
                                                            className="w-24 h-24 object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExistingVariantImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

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
                                                className="flex items-center justify-center gap-2 p-2 border border-amber-300 rounded-lg cursor-pointer hover:bg-amber-100 text-amber-900"
                                            >
                                                <Upload className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {variantImages[index] || existingVariantImages[index] ? "Thay đổi ảnh" : "Thêm ảnh mới"}
                                                </span>
                                            </label>
                                            
                                            {variantImages[index] && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-2">Ảnh mới:</p>
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={URL.createObjectURL(variantImages[index])}
                                                            alt="New Variant"
                                                            className="w-24 h-24 object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariantImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {errors.bienTheSanPhams?.[index] && (
                                        <p className="text-xs text-red-500">
                                            {Object.values(errors.bienTheSanPhams[index]).map(err => err.message).join(', ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="border-t border-amber-200 pt-4 mt-3 bg-white dark:!bg-white">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="bg-white text-amber-900 border-amber-300 hover:bg-amber-50 h-11 px-8 rounded-xl font-medium"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-amber-600 text-white border border-amber-600 hover:bg-amber-700 shadow-sm transition-all duration-200 h-11 px-8 rounded-xl font-medium"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            "Cập nhật sản phẩm"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

