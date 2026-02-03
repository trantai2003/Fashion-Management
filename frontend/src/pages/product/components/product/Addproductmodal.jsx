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
import * as yup from "yup";

const addProductSchema = yup.object({
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
            mauSacId: yup.number().required("Màu sắc là bắt buộc").nullable(),
            sizeId: yup.number().required("Size là bắt buộc").nullable(),
            chatLieuId: yup.number().required("Chất liệu là bắt buộc").nullable(),
            maSku: yup.string().required("Mã SKU là bắt buộc"),
            maVachSku: yup.string(),
            giaVon: yup.number().min(0, "Giá vốn phải >= 0").required("Giá vốn là bắt buộc"),
            giaBan: yup.number().min(0, "Giá bán phải >= 0").required("Giá bán là bắt buộc"),
            trangThai: yup.number().required(),
        })
    ).min(1, "Phải có ít nhất 1 biến thể")
});

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
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

    const bienTheSanPhams = watch("bienTheSanPhams");

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
        setVariantImages({});
    }, [reset]);

    useEffect(() => {
        if (isOpen) {
            handleResetForm();
        }
    }, [isOpen, handleResetForm]);

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

    const onSubmit = async (data) => {
        // Validate product images
        if (productImages.length === 0) {
            toast.error("Vui lòng thêm ít nhất một ảnh sản phẩm");
            return;
        }

        // Validate variant images
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
                giaVonMacDinh: Number(data.giaVonMacDinh),
                giaBanMacDinh: Number(data.giaBanMacDinh),
                trangThai: Number(data.trangThai),
                bienTheSanPhams: data.bienTheSanPhams.map(variant => ({
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

            const jsonBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append('creating', jsonBlob);

            // Append product images
            productImages.forEach((file) => {
                formData.append('anhSanPhams', file);
            });

            // Append variant images in order
            data.bienTheSanPhams.forEach((_, index) => {
                if (variantImages[index]) {
                    formData.append('anhBienThes', variantImages[index]);
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
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);

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
        // Remove the variant image for this index and adjust indices
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
            <DialogContent className="sm:max-w-[900px]
    max-h-[90vh]
    bg-white text-gray-900
    border border-gray-200
    rounded-xl shadow-sm
    dark:bg-white dark:text-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-purple-700">
                        Thêm sản phẩm mới
                    </DialogTitle>
                    <DialogDescription>
                        Nhập đầy đủ thông tin sản phẩm và biến thể. Ảnh sản phẩm và ảnh biến thể là bắt buộc.
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

                        {/* Ảnh sản phẩm - Required */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                                Ảnh sản phẩm <span className="text-red-500">*</span>
                            </h3>
                            <div className="border-2 border-dashed rounded-lg p-4 space-y-2">
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
                                    <span className="text-sm">Chọn ảnh sản phẩm</span>
                                </label>
                                {productImages.length === 0 && (
                                    <p className="text-xs text-gray-500 text-center">Vui lòng thêm ít nhất 1 ảnh sản phẩm</p>
                                )}
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
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-sm text-gray-700">
                                    Biến thể sản phẩm <span className="text-red-500">*</span>
                                </h3>
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
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Thêm biến thể
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-gray-50 relative overflow-visible">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Biến thể #{index + 1}</span>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveVariant(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 overflow-visible">
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
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Chọn màu" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={4}
                                                            className="z-110 bg-white"
                                                        >
                                                            {colors.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có màu sắc</div>
                                                            ) : (
                                                                colors.map((color) => (
                                                                    <SelectItem
                                                                        key={`color-${index}-${color.id}`}
                                                                        value={color.id.toString()}
                                                                    >
                                                                        {color.tenMau}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
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
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Chọn size" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={4}
                                                            className="z-110 bg-white"
                                                        >
                                                            {sizes.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có size</div>
                                                            ) : (
                                                                sizes.map((size) => (
                                                                    <SelectItem
                                                                        key={`size-${index}-${size.id}`}
                                                                        value={size.id.toString()}
                                                                    >
                                                                        {size.tenSize}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
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
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Chọn chất liệu" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={4}
                                                            className="z-110 bg-white"
                                                        >
                                                            {materials.length === 0 ? (
                                                                <div className="p-2 text-sm text-gray-500">Không có chất liệu</div>
                                                            ) : (
                                                                materials.map((material) => (
                                                                    <SelectItem
                                                                        key={`material-${index}-${material.id}`}
                                                                        value={material.id.toString()}
                                                                    >
                                                                        {material.tenChatLieu}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        {/* Mã SKU */}
                                        <div className="col-span-2 space-y-2">
                                            <Label>Mã SKU <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.maSku`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Mã SKU" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

                                        {/* Mã vạch SKU */}
                                        <div className="space-y-2">
                                            <Label>Mã vạch SKU</Label>
                                            <Controller
                                                name={`bienTheSanPhams.${index}.maVachSku`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Mã vạch SKU" disabled={isSubmitting} />
                                                )}
                                            />
                                        </div>

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

                                    {/* Variant Image - Required */}
                                    <div className="space-y-2">
                                        <Label>Ảnh biến thể <span className="text-red-500">*</span></Label>
                                        <div className="border-2 border-dashed rounded-lg p-3 space-y-2">
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
                                                <span className="text-sm">Chọn ảnh biến thể</span>
                                            </label>
                                            {!variantImages[index] && (
                                                <p className="text-xs text-gray-500 text-center">Bắt buộc thêm 1 ảnh cho biến thể này</p>
                                            )}
                                            {variantImages[index] && (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={URL.createObjectURL(variantImages[index])}
                                                        alt="Variant Preview"
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
                                Đang lưu...
                            </>
                        ) : (
                            "Lưu sản phẩm"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}