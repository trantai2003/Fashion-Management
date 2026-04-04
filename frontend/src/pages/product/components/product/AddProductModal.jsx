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

// ==========================================
// HELPER FUNCTIONS FOR VALIDATION
// ==========================================

/**
 * Chuẩn hóa khoảng trắng trong chuỗi
 * - Xóa khoảng trắng ở đầu và cuối (trim)
 * - Thay 2 hoặc nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
 * Ví dụ: "  Áo   sơ  mi  " → "Áo sơ mi"
 */
const normalizeSpaces = (value) =>
    typeof value === "string" ? value.trim().replace(/\s{2,}/g, " ") : value;

/**
 * Chuyển chuỗi rỗng thành null
 * - Nếu originalValue là string rỗng hoặc chỉ có khoảng trắng → trả về null
 * - Nếu không, trả về giá trị đã transform
 * Dùng để tính toán với giá (null = không nhập, khác 0)
 */
const emptyToNull = (value, originalValue) => {
    if (typeof originalValue === "string" && originalValue.trim() === "") return null;
    return value;
};

/**
 * Regex kiểm tra số thập phân tối đa 2 chữ số
 * Ví dụ hợp lệ: 100, 99.9, 99.99
 * Ví dụ không hợp lệ: 99.999, 99.9999
 */
const decimal2Regex = /^\d+(\.\d{1,2})?$/;

/**
 * Regex kiểm tra định dạng mã vạch
 * Chỉ cho phép: chữ cái (A-Z, a-z), số (0-9), dấu gạch ngang (-), dấu gạch dưới (_)
 * KHÔNG cho phép: khoảng trắng, ký tự đặc biệt khác
 * Ví dụ hợp lệ: ABC-123_XYZ, SKU001-ABC
 */
const barcodeRegex = /^[A-Za-z0-9_-]+$/;

// ==========================================
// YUP VALIDATION SCHEMA
// ==========================================
/**
 * Schema define các rule validate cho form "Thêm sản phẩm mới"
 * Sử dụng Yup library để validate toàn bộ form trước khi submit
 * Mode "onChange" sẽ kiểm tra realtime khi người dùng nhập/thay đổi dữ liệu
 */
const addProductSchema = yup.object({
    // ===== THÔNG TIN CƠ BẢN =====

    /**
     * TÊN SẢN PHẨM (tenSanPham)
     * Status: Bắt buộc nhập (*)
     * Rules:
     *  1. Bắt buộc nhập (required)
     *  2. Tự động chuẩn hóa: trim khoảng trắng đầu/cuối + gộp khoảng trắng liên tiếp
     *  3. Kiểm tra không rỗng (chỉ khoảng trắng)
     *  4. Độ dài tối thiểu 3 ký tự
     *  5. Độ dài tối đa 150 ký tự
     *  6. KHÔNG cho phép 2 khoảng trắng liên tiếp
     * Ví dụ:
     *  - Input: "  Áo   sơ   mi  " → Lưu: "Áo sơ mi" ✅
     *  - Input: "AB" → Error: "Tên sản phẩm phải từ 3 ký tự trở lên" ❌
     *  - Input: "" → Error: "Vui lòng nhập tên sản phẩm" ❌
     */
    tenSanPham: yup
        .string()
        .transform((_, originalValue) => normalizeSpaces(originalValue))
        .required("Vui lòng nhập tên sản phẩm")
        .test("not-blank", "Vui lòng nhập tên sản phẩm", (value) => !!value && value.trim().length > 0)
        .min(3, "Tên sản phẩm phải từ 3 ký tự trở lên")
        .max(150, "Tên sản phẩm không được vượt quá 150 ký tự")
        .test("no-double-space", "Tên sản phẩm không được chứa 2 khoảng trắng liên tiếp", (value) =>
            value ? !/\s{2,}/.test(value) : true
        ),

    /**
     * MÃ SẢN PHẨM (maSanPham)
     * Status: Không bắt buộc, tự động sinh (hệ thống tạo)
     * Rules:
     *  - Chỉ cho phép null hoặc string
     *  - Không cần validate vì hệ thống tự động sinh
     */
    maSanPham: yup.string().nullable(),

    /**
     * MÃ VẠCH SẢN PHẨM (maVach)
     * Status: Không bắt buộc nhập
     * Rules:
     *  1. Không bắt buộc (nullable)
     *  2. Nếu nhập: tự động trim khoảng trắng
     *  3. Định dạng: chỉ cho phép chữ, số, -, _ (không khoảng trắng)
     *  4. Độ dài: 8-50 ký tự
     * Ví dụ:
     *  - Input: "" → OK (không bắt buộc) ✅
     *  - Input: "ABC-123_XYZ" → OK ✅
     *  - Input: "ABC XYZ" (có space) → Error: "Mã vạch không đúng định dạng" ❌
     *  - Input: "ABC" (< 8 ký tự) → Error: "Mã vạch không đúng định dạng" ❌
     */
    maVach: yup
        .string()
        .transform((_, originalValue) => (typeof originalValue === "string" ? originalValue.trim() : originalValue))
        .nullable()
        .test("barcode-format", "Mã vạch không đúng định dạng", (value) => {
            if (!value) return true;
            return barcodeRegex.test(value) && value.length >= 8 && value.length <= 50;
        }),

    /**
     * DANH MỤC (danhMucId)
     * Status: Bắt buộc chọn (*)
     * Rules:
     *  1. Bắt buộc chọn danh mục
     *  2. Phải là số (number)
     * Ví dụ:
     *  - Không chọn → Error: "Danh mục là bắt buộc" ❌
     *  - Chọn danh mục → OK ✅
     */
    danhMucId: yup.number().required("Danh mục là bắt buộc").typeError("Vui lòng chọn danh mục"),

    /**
     * MÔ TẢ (moTa)
     * Status: Không bắt buộc
     * Rules:
     *  1. Không bắt buộc nhập
     *  2. Nếu nhập: tự động trim khoảng trắng đầu/cuối
     *  3. Độ dài tối đa 1000 ký tự
     * Ví dụ:
     *  - Input: "" → OK ✅
     *  - Input: "   Áo sơ mi chất lượng cao   " → Lưu: "Áo sơ mi chất lượng cao" ✅
     *  - Input: text > 1000 ký tự → Error: "Mô tả không được vượt quá 1000 ký tự" ❌
     */
    moTa: yup
        .string()
        .transform((_, originalValue) => (typeof originalValue === "string" ? originalValue.trim() : originalValue))
        .nullable()
        .max(1000, "Mô tả không được vượt quá 1000 ký tự"),

    /**
     * GIÁ VỐN MẶC ĐỊNH (giaVonMacDinh)
     * Status: Không bắt buộc
     * Rules:
     *  1. Không bắt buộc nhập (nullable)
     *  2. Nếu để trống → xem như null (không validate giá trị)
     *  3. Nếu nhập: phải >= 0
     *  4. Nếu nhập: tối đa 2 chữ số thập phân (VD: 99.99, 100.50)
     * Ví dụ:
     *  - Input: "" → OK ✅
     *  - Input: "100" → OK ✅
     *  - Input: "99.99" → OK ✅
     *  - Input: "99.999" → Error: "Giá vốn chỉ được tối đa 2 chữ số thập phân" ❌
     *  - Input: "-10" → Error: "Giá vốn phải là số lớn hơn hoặc bằng 0" ❌
     */
    giaVonMacDinh: yup
        .number()
        .transform(emptyToNull)
        .nullable()
        .test("default-cost-format", "Giá vốn phải là số lớn hơn hoặc bằng 0", (value) => value == null || value >= 0)
        .test(
            "default-cost-decimal",
            "Giá vốn chỉ được tối đa 2 chữ số thập phân",
            (value) => value == null || decimal2Regex.test(String(value))
        ),

    /**
     * GIÁ BÁN MẶC ĐỊNH (giaBanMacDinh)
     * Status: Không bắt buộc
     * Rules:
     *  1. Không bắt buộc nhập (nullable)
     *  2. Nếu để trống → xem như null
     *  3. Nếu nhập: phải >= 0
     *  4. Nếu nhập: tối đa 2 chữ số thập phân
     *  5. ⭐ BẮת BUỘC: Nếu cả giá bán và giá vốn đều nhập → giá bán phải > 70% giá vốn
     *     (Không được ≤ 70% giá vốn)
     * Ví dụ:
     *  - Input: "50" (giá vốn = 100) → 50 ≤ 70 → Error: "Giá bán phải cao hơn 70% giá vốn" ❌
     *  - Input: "75" (giá vốn = 100) → 75 > 70 → OK ✅
     *  - Input: "150" (giá vốn = 100) → OK ✅
     */
    giaBanMacDinh: yup
        .number()
        .transform(emptyToNull)
        .nullable()
        .test("default-price-format", "Giá bán phải là số lớn hơn hoặc bằng 0", (value) => value == null || value >= 0)
        .test(
            "default-price-decimal",
            "Giá bán chỉ được tối đa 2 chữ số thập phân",
            (value) => value == null || decimal2Regex.test(String(value))
        )
        .test(
            "price-range-validation",
            function(value) {
                // Kiểm tra: Giá bán phải trong khoảng (giá vốn, giá vốn * 1.7]
                // Tức là: Giá vốn < Giá bán <= Giá vốn * 1.7 (+ 70%)
                const { giaVonMacDinh } = this.parent;

                if (value != null && giaVonMacDinh != null && giaVonMacDinh > 0) {
                    const minPrice = giaVonMacDinh; // Tối thiểu phải > giá vốn
                    const maxPrice = giaVonMacDinh * 1.7; // Tối đa không vượt quá giá vốn + 70%

                    // Kiểm tra giá bán < giá vốn
                    if (value <= minPrice) {
                        return this.createError({
                            message: `Giá bán phải cao hơn giá vốn (${minPrice.toFixed(2)}đ)`,
                        });
                    }

                    // Kiểm tra giá bán > giá vốn + 70%
                    if (value > maxPrice) {
                        return this.createError({
                            message: `Giá bán không được vượt quá 70% so với giá vốn (${maxPrice.toFixed(2)}đ)`,
                        });
                    }
                }

                return true;
            }
        ),

    /**
     * MỨC TỒN TỐI THIỂU (mucTonToiThieu)
     * Status: Bắt buộc nhập (*)
     * Rules:
     *  1. Bắt buộc nhập
     *  2. Phải là số nguyên (không có phần thập phân)
     *  3. Phải >= 0 (không âm)
     *  4. Tối đa 999999
     * Ví dụ:
     *  - Input: "" → Error: "Vui lòng nhập mức tồn tối thiểu" ❌
     *  - Input: "10.5" → Error: "Mức tồn tối thiểu phải là số nguyên" ❌
     *  - Input: "-5" → Error: "Mức tồn tối thiểu không được nhỏ hơn 0" ❌
     *  - Input: "100" → OK ✅
     */
    mucTonToiThieu: yup
        .number()
        .typeError("Mức tồn tối thiểu phải là số nguyên")
        .required("Vui lòng nhập mức tồn tối thiểu")
        .integer("Mức tồn tối thiểu phải là số nguyên")
        .min(0, "Mức tồn tối thiểu không được nhỏ hơn 0")
        .max(999999, "Mức tồn tối thiểu không được vượt quá 999999"),

    /**
     * TRẠNG THÁI MẶC ĐỊNH (trangThai)
     * Status: Bắt buộc chọn
     * Rules:
     *  - Bắt buộc chọn (1 = Còn hàng, 0 = Hết hàng)
     */
    trangThai: yup.number().required(),

    // ===== BIẾN THỂ SẢN PHẨM =====
    /**
     * DANH SÁCH BIẾN THỂ (bienTheSanPhams)
     * Status: Bắt buộc có ít nhất 1 biến thể (*)
     * Rules:
     *  1. Là mảng (array)
     *  2. Mỗi item phải validate theo object schema dưới đây
     *  3. Phải có ít nhất 1 phần tử
     */
    bienTheSanPhams: yup
        .array()
        .of(
            yup.object({
                /**
                 * MÀU SẮC (mauSacId)
                 * Status: Bắt buộc chọn (*)
                 * Rules:
                 *  - Bắt buộc chọn màu sắc
                 *  - Phải là số (ID của màu)
                 */
                mauSacId: yup.number().required("Màu sắc là bắt buộc").nullable(),

                /**
                 * SIZE (sizeId)
                 * Status: Bắt buộc chọn (*)
                 * Rules:
                 *  - Bắt buộc chọn size
                 *  - Phải là số (ID của size)
                 */
                sizeId: yup.number().required("Size là bắt buộc").nullable(),

                /**
                 * CHẤT LIỆU (chatLieuId)
                 * Status: Bắt buộc chọn (*)
                 * Rules:
                 *  - Bắt buộc chọn chất liệu
                 *  - Phải là số (ID của chất liệu)
                 */
                chatLieuId: yup.number().required("Chất liệu là bắt buộc").nullable(),

                /**
                 * MÃ SKU (maSku)
                 * Status: Không bắt buộc, tự động sinh
                 * Rules:
                 *  - Hệ thống tự động ghép mã: [mã sản phẩm] + [màu] + [size] + [chất liệu]
                 *  - Ví dụ: AT260331-CL001-S-M002
                 */
                maSku: yup.string().nullable(),

                /**
                 * MÃ VẠCH SKU (maVachSku)
                 * Status: Không bắt buộc
                 * Rules: Giống như mã vạch sản phẩm
                 *  1. Không bắt buộc
                 *  2. Nếu nhập: trim khoảng trắng
                 *  3. Định dạng: chỉ chữ, số, -, _
                 *  4. Độ dài: 8-50 ký tự
                 */
                maVachSku: yup
                    .string()
                    .transform((_, originalValue) => (typeof originalValue === "string" ? originalValue.trim() : originalValue))
                    .nullable()
                    .test("barcode-sku-format", "Mã vạch SKU không đúng định dạng", (value) => {
                        if (!value) return true;
                        return barcodeRegex.test(value) && value.length >= 8 && value.length <= 50;
                    }),

                /**
                 * GIÁ VỐN BIẾN THỂ (giaVon)
                 * Status: Không bắt buộc
                 * Rules: Giống như giá vốn mặc định
                 *  1. Không bắt buộc
                 *  2. Nếu để trống → null
                 *  3. Nếu nhập: >= 0
                 *  4. Nếu nhập: tối đa 2 chữ số thập phân
                 */
                giaVon: yup
                    .number()
                    .transform(emptyToNull)
                    .nullable()
                    .test("variant-cost-format", "Giá vốn phải là số lớn hơn hoặc bằng 0", (value) => value == null || value >= 0)
                    .test(
                        "variant-cost-decimal",
                        "Giá vốn chỉ được tối đa 2 chữ số thập phân",
                        (value) => value == null || decimal2Regex.test(String(value))
                    ),

                /**
                 * GIÁ BÁN BIẾN THỂ (giaBan)
                 * Status: Không bắt buộc
                 * Rules: Giống như giá bán mặc định
                 *  1. Không bắt buộc
                 *  2. Nếu để trống → null
                 *  3. Nếu nhập: >= 0
                 *  4. Nếu nhập: tối đa 2 chữ số thập phân
                 */
                giaBan: yup
                    .number()
                    .transform(emptyToNull)
                    .nullable()
                    .test("variant-price-format", "Giá bán phải là số lớn hơn hoặc bằng 0", (value) => value == null || value >= 0)
                    .test(
                        "variant-price-decimal",
                        "Giá bán chỉ được tối đa 2 chữ số thập phân",
                        (value) => value == null || decimal2Regex.test(String(value))
                    ),

                /**
                 * TRẠNG THÁI BIẾN THỂ (trangThai)
                 * Status: Bắt buộc chọn
                 * Rules:
                 *  - Bắt buộc chọn (1 = Hoạt động, 0 = Tạm ngừng)
                 */
                trangThai: yup.number().required(),
            })
        )
        .min(1, "Phải có ít nhất 1 biến thể"),
});

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
    // ===== STATE QUẢN LÝ DỮ LIỆU CẮM CHỌN =====
    const [categories, setCategories] = useState([]);    // Danh sách danh mục
    const [colors, setColors] = useState([]);            // Danh sách màu sắc
    const [sizes, setSizes] = useState([]);              // Danh sách size
    const [materials, setMaterials] = useState([]);      // Danh sách chất liệu
    const [productImages, setProductImages] = useState([]); // Mảng ảnh sản phẩm chính
    const [variantImages, setVariantImages] = useState({});  // Object { indexVariant: file } của ảnh biến thể

    // ===== REACT HOOK FORM - QUẢN LÝ FORM DATA =====
    /**
     * useForm: Hook chính quản lý trạng thái form và validation
     *
     * Cấu hình:
     * - resolver: yupResolver(addProductSchema) → dùng schema Yup để validate
     * - mode: "onChange" → validate realtime khi người dùng nhập/thay đổi
     * - reValidateMode: "onChange" → validate lại realtime sau khi có lỗi
     * - criteriaMode: "firstError" → chỉ hiển thị lỗi đầu tiên của mỗi field
     * - defaultValues: giá trị khởi tạo ban đầu của form
     */
    const {
        control,                           // Dùng để quản lý Controller
        handleSubmit,                       // Wrapper function cho form submit
        reset,                              // Hàm reset form về trạng thái khởi tạo
        formState: { errors, isSubmitting }, // errors = object lỗi, isSubmitting = đang submit
        watch,                              // Hàm theo dõi giá trị field cụ thể realtime
        setValue                            // Hàm set giá trị field
    } = useForm({
        resolver: yupResolver(addProductSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        defaultValues: {
            // Thông tin cơ bản
            tenSanPham: "",
            maSanPham: "",
            maVach: "",
            danhMucId: "",
            moTa: "",
            giaVonMacDinh: 0,
            giaBanMacDinh: 0,
            mucTonToiThieu: 0,
            trangThai: 1,
            // Biến thể - khởi tạo 1 biến thể trống
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

    /**
     * useFieldArray: Hook quản lý mảng field động (biến thể)
     * - control: liên kết với form control
     * - name: "bienTheSanPhams" → tên field mảng
     * - fields: danh sách các field trong mảng (với ID động)
     * - append: thêm 1 item mới vào mảng
     * - remove: xóa item theo index
     */
    const { fields, append, remove } = useFieldArray({
        control,
        name: "bienTheSanPhams"
    });


    const handleResetForm = useCallback(() => {
        // Reset ve state ban dau sau khi tao thanh cong hoac khi dong modal.
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
            // Moi lan mo modal thi reset form de tranh du lieu cu con sot lai.
            handleResetForm();
        }
    }, [isOpen, handleResetForm]);

    // ==========================================
    // LOGIC LÀM PHẲNG CÂY DANH MỤC
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
                // Tai du lieu tham chieu cho form (mau, size, chat lieu, danh muc).
                // Luong backend: Controller.getAll -> Service.getAll -> Repository.findAll.
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
        // [User nhan Luu trong modal Them san pham]
        // Buoc 0: Chuẩn hóa du lieu truoc khi submit
        data.tenSanPham = normalizeSpaces(data.tenSanPham);
        data.moTa = data.moTa ? data.moTa.trim() : "";
        data.maVach = data.maVach ? data.maVach.trim() : "";

        data.bienTheSanPhams = data.bienTheSanPhams.map((v) => ({
            ...v,
            maVachSku: v.maVachSku ? v.maVachSku.trim() : "",
        }));

        // Buoc 1: Validate bo sung o client cho anh san pham va anh bien the.
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
            // Buoc 2: Map form UI -> payload backend (RequestDTO) trong FormData.
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

            // Buoc 3: Frontend -> ProductController.create(@Valid)
            // -> ProductService.create(@Transactional, validate nghiep vu)
            // -> ProductRepository.save + repository lien quan variant/image.
            const res = await productService.createProduct(formData);

            if (res?.data?.status >= 400) {
                toast.error(res.data.message || 'Có lỗi xảy ra');
                return;
            }

            toast.success("Tạo sản phẩm thành công!");
            // Buoc 4: Reload man Quan ly san pham thong qua callback onSuccess.
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
        // Chi cho dong modal khi khong trong trang thai submit.
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

                    <form   /* Form nhập thông tin thêm sản phẩm mới*/
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
                                                    <Input
                                                        {...field}
                                                        placeholder="VD: Áo sơ mi nam cổ tròn"
                                                        disabled={isSubmitting}
                                                        className={`${errors.tenSanPham ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                    />
                                                )}
                                            />
                                            {errors.tenSanPham && (
                                                <p className="text-xs text-red-500 font-medium">{errors.tenSanPham.message}</p>
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
                                                    <Input
                                                        {...field}
                                                        placeholder="Mã vạch (Nếu có)"
                                                        disabled={isSubmitting}
                                                        className={`${errors.maVach ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                    />
                                                )}
                                            />
                                            {errors.maVach && (
                                                <p className="text-xs text-red-500 font-medium">{errors.maVach.message}</p>
                                            )}
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
                                            <Label htmlFor="mucTonToiThieu">Mức tồn tối thiểu <span className="text-red-500">*</span></Label>
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
                                                        className={`${errors.mucTonToiThieu ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                    />
                                                )}
                                            />
                                            {errors.mucTonToiThieu && (
                                                <p className="text-xs text-red-500 font-medium">{errors.mucTonToiThieu.message}</p>
                                            )}
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
                                                        placeholder="0 (Tự động cập nhật)"
                                                       disabled={true}
                                                        className="bg-yellow-50 text-gray-600 cursor-not-allowed border-yellow-300 italic"
                                                    />
                                                )}
                                            />
                                            {errors.giaVonMacDinh && (
                                                <p className="text-xs text-red-500 font-medium">{errors.giaVonMacDinh.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="giaBanMacDinh">Giá bán mặc định</Label>
                                            <Controller
                                                name="giaBanMacDinh"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="0 (Tự động cập nhật)"
                                                        disabled={isSubmitting}
                                                        className={`${errors.giaBanMacDinh ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                    />
                                                )}
                                            />
                                            {errors.giaBanMacDinh && (
                                                <p className="text-xs text-red-500 font-medium">{errors.giaBanMacDinh.message}</p>
                                            )}
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
                                                        className={`resize-none ${errors.moTa ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                    />
                                                )}
                                            />
                                            {errors.moTa && (
                                                <p className="text-xs text-red-500 font-medium">{errors.moTa.message}</p>
                                            )}
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
                                                            <Input
                                                                {...field}
                                                                placeholder="Mã vạch SKU"
                                                                disabled={isSubmitting}
                                                                className={`bg-white ${errors.bienTheSanPhams?.[index]?.maVachSku ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                            />
                                                        )}
                                                    />
                                                    {errors.bienTheSanPhams?.[index]?.maVachSku && (
                                                        <p className="text-xs text-red-500 font-medium">{errors.bienTheSanPhams[index].maVachSku.message}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Giá vốn</Label>
                                                    <Controller
                                                        name={`bienTheSanPhams.${index}.giaVon`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0"
                                                                placeholder="0 (Tự động)"
                                                               disabled={true}
                                                        className="bg-yellow-50 text-gray-600 cursor-not-allowed border-yellow-300 italic"
                                                            />
                                                        )}
                                                    />
                                                    {errors.bienTheSanPhams?.[index]?.giaVon && (
                                                        <p className="text-xs text-red-500 font-medium">{errors.bienTheSanPhams[index].giaVon.message}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Giá bán</Label>
                                                    <Controller
                                                        name={`bienTheSanPhams.${index}.giaBan`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0"
                                                                placeholder="0 (Tự động)"
                                                                disabled={isSubmitting}
                                                                className={`bg-white ${errors.bienTheSanPhams?.[index]?.giaBan ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                                                            />
                                                        )}
                                                    />
                                                    {errors.bienTheSanPhams?.[index]?.giaBan && (
                                                        <p className="text-xs text-red-500 font-medium">{errors.bienTheSanPhams[index].giaBan.message}</p>
                                                    )}
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