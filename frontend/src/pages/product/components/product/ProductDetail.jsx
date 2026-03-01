import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Star, Heart, ShoppingCart, Truck, Shield, Clock, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import { formatCurrency } from "@/utils/formatters";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const res = await productService.getProductById(id);
                
                if (res.data?.status === 200) {
                    const productData = res.data.data;
                    setProduct(productData);
                    
                    // Set first variant as default
                    if (productData.bienTheSanPhams?.length > 0) {
                        setSelectedVariant(productData.bienTheSanPhams[0]);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                toast.error("Không thể tải thông tin sản phẩm");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const handlePreviousImage = () => {
        if (product?.anhQuanAos?.length > 0) {
            setSelectedImageIndex((prev) => 
                prev === 0 ? product.anhQuanAos.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (product?.anhQuanAos?.length > 0) {
            setSelectedImageIndex((prev) => 
                prev === product.anhQuanAos.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const handleAddToCart = () => {
        toast.success("Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = () => {
        toast.success("Chuyển đến trang thanh toán!");
    };

    const handleAddToWishlist = () => {
        toast.success("Đã thêm vào danh sách yêu thích!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
                    <p className="text-gray-600">Sản phẩm này không tồn tại hoặc đã bị xóa</p>
                </div>
            </div>
        );
    }

    const currentPrice = selectedVariant?.giaBan || product.giaBanMacDinh;
    const originalPrice = currentPrice * 1.3; // Giả lập giá gốc

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                            {product.anhQuanAos?.length > 0 ? (
                                <>
                                    <img
                                        src={product.anhQuanAos[selectedImageIndex]?.tepTin?.duongDan}
                                        alt={product.tenSanPham}
                                        className="w-full h-full object-cover"
                                    />
                                    {product.anhQuanAos.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePreviousImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-24 h-24 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-5 gap-2">
                            {product.anhQuanAos?.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                                        selectedImageIndex === index
                                            ? 'border-purple-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={image.tepTin?.duongDan}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.tenSanPham}</h1>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3].map((star) => (
                                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    {[4, 5].map((star) => (
                                        <Star key={star} className="w-5 h-5 text-gray-300" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">3.7</span>
                                <span className="text-sm text-gray-400">/ 120 reviews</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>🛒 154 orders</span>
                            </div>
                        </div>

                        {/* Stock Status */}
                        {product.trangThai === 1 ? (
                            <Badge className="bg-green-50 text-green-700 hover:bg-green-100">
                                ✓ In stock
                            </Badge>
                        ) : (
                            <Badge className="bg-red-50 text-red-700 hover:bg-red-100">
                                Out of stock
                            </Badge>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-purple-600">
                                {formatCurrency(currentPrice)}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                            </span>
                        </div>

                        {/* Select Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select condition
                            </label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">Brand new</Button>
                                <Button variant="outline" className="flex-1">Used</Button>
                                <Button variant="outline" className="flex-1">Refurbished</Button>
                            </div>
                        </div>

                        {/* Color Selection */}
                        {selectedVariant && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color: <span className="text-purple-600">{selectedVariant.mauSac?.tenMau || 'N/A'}</span>
                                </label>
                                <div className="flex gap-2">
                                    {product.bienTheSanPhams?.map((variant, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleVariantSelect(variant)}
                                            className={`w-10 h-10 rounded-full border-2 transition ${
                                                selectedVariant.id === variant.id
                                                    ? 'border-purple-600 scale-110'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            style={{
                                                backgroundColor: variant.mauSac?.maMau || '#ccc'
                                            }}
                                            title={variant.mauSac?.tenMau}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Details */}
                        <div className="space-y-2 text-sm">
                            {selectedVariant?.chatLieu && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700">Material: {selectedVariant.chatLieu.tenChatLieu}</span>
                                </div>
                            )}
                            {selectedVariant?.mauSac && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700">Color: {selectedVariant.mauSac.tenMau}</span>
                                </div>
                            )}
                            {selectedVariant?.size && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700">Size: {selectedVariant.size.tenSize}</span>
                                </div>
                            )}
                            {selectedVariant?.maSku && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700">SKU: {selectedVariant.maSku}</span>
                                </div>
                            )}
                        </div>

                        {/* Quantity & Actions */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">Kg</span>
                            </div>

                            {/* <div className="flex gap-3">
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Add to cart
                                </Button>
                                <Button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
                                >
                                    Buy now
                                </Button>
                            </div>

                            <Button
                                onClick={handleAddToWishlist}
                                variant="outline"
                                className="w-full h-12 border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                                <Heart className="w-5 h-5 mr-2" />
                                Add to wishlist
                            </Button> */}
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                            <div className="text-center">
                                <Truck className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <div className="text-xs text-gray-600">Worldwide shipping</div>
                            </div>
                            <div className="text-center">
                                <Shield className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <div className="text-xs text-gray-600">Secure payment</div>
                            </div>
                            <div className="text-center">
                                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <div className="text-xs text-gray-600">2 years warranty</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        <Tabs defaultValue="specifications" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                <TabsTrigger
                                    value="specifications"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-6 py-4"
                                >
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-6 py-4"
                                >
                                    Reviews
                                </TabsTrigger>
                                <TabsTrigger
                                    value="shipping"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-6 py-4"
                                >
                                    Shipping info
                                </TabsTrigger>
                                <TabsTrigger
                                    value="seller"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-6 py-4"
                                >
                                    Seller profile
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="specifications" className="p-6">
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed">
                                        {product.moTa || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[1, 2, 3].map((star) => (
                                                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                    {[4, 5].map((star) => (
                                                        <Star key={star} className="w-5 h-5 text-gray-300" />
                                                    ))}
                                                </div>
                                                <span className="text-2xl font-bold">3.7</span>
                                                <span className="text-gray-500">/ 120 reviews</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                                            Write a review
                                        </Button>
                                    </div>
                                    <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="shipping" className="p-6">
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="font-semibold text-lg">Thông tin vận chuyển</h3>
                                    <p>• Miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
                                    <p>• Giao hàng trong vòng 3-5 ngày làm việc</p>
                                    <p>• Hỗ trợ đổi trả trong vòng 30 ngày</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="seller" className="p-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Thông tin người bán</h3>
                                    <p className="text-gray-700">Cửa hàng chính thức với hơn 5 năm kinh nghiệm trong ngành thời trang.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Related Products Sidebar (similar to image) */}
                {/* <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">You may also like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <Card key={item} className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                                <div className="aspect-square bg-gray-100" />
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-lg font-bold text-purple-600">$19.50</span>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                                            Add to cart
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-600">T-shirts with multiple colors</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div> */}
            </div>
        </div>
    );
}