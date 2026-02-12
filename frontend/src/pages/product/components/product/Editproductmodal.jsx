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
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import * as yup from "yup";

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
                isImageUpdated: productImageUpdated,
                bienTheSanPhams: data.bienTheSanPhams.map((variant, index) => ({
                    id: variant.id,
                    giaVon: Number(variant.giaVon),
                    giaBan: Number(variant.giaBan),
                    trangThai: Number(variant.trangThai),
                    isImageUpdated: !!variantImages[index], // Check if this variant has a new image
                })),
            };

            const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append('updating', jsonBlob);

            // Append product images if updated
            if (productImageUpdated) {
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
                <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
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
            <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-purple-700">
                        Chỉnh sửa sản phẩm
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin sản phẩm và biến thể. Nhấn lưu khi hoàn tất.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(90vh-12rem)] overflow-y-auto overflow-x-visible px-1">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Thông tin cơ bản</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Tên sản phẩm */}
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

                                {/* Mã sản phẩm & Mã vạch */}
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

                                {/* Hidden field for danhMucId - always set to 1 */}
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
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Đang bán</SelectItem>
                                                    <SelectItem value="0">Ngừng bán</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Giá mặc định */}
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

                                {/* Mức tồn tối thiểu */}
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

                                {/* Mô tả */}
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

                        {/* Ảnh sản phẩm */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Ảnh sản phẩm</h3>
                            <div className="border-2 border-dashed rounded-lg p-4 space-y-2">
                                {/* Existing images */}
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
                                    className="flex items-center justify-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="text-sm">Thêm ảnh mới</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
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

                        {/* Biến thể sản phẩm */}
                        <div className="space-y-4 overflow-visible">
                            <div className="border-b pb-2">
                                <h3 className="font-semibold text-sm text-gray-700">
                                    Biến thể sản phẩm
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Chỉ có thể cập nhật giá và trạng thái của biến thể</p>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-gray-50 relative overflow-visible">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Biến thể #{index + 1}</span>
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
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
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
                                        <div className="border-2 border-dashed rounded-lg p-3 space-y-2">
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
                                                className="flex items-center justify-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
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
                    </form>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-700"
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