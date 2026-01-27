// src/pages/supplier/SupplierList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    getAllSupplier,
    deleteSupplier,
} from "@/services/supplierService";

export default function SupplierList() {
    // State management
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Fetch danh sách nhà cung cấp từ API
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllSupplier(search);
            setSuppliers(data);
        } catch {
            toast.error("Không thể tải danh sách nhà cung cấp");
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Load dữ liệu khi component mount hoặc search thay đổi
    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // Xử lý xóa nhà cung cấp
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSupplier(deleteId);
            toast.success("Xóa nhà cung cấp thành công");
            fetchSuppliers(); // Reload danh sách
        } catch {
            toast.error("Xóa thất bại");
        } finally {
            setDeleteId(null); // Reset deleteId
        }
    };

    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = suppliers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(suppliers.length / itemsPerPage);

    return (
        <div className="container mx-auto py-10">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                {/* Header với tiêu đề và nút thêm mới */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">Danh sách Nhà Cung Cấp</CardTitle>
                    <Button onClick={() => navigate("/supplier/new")} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Thêm nhà cung cấp
                    </Button>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Search bar */}
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm theo mã hoặc tên..."
                                className="w-full rounded-lg pl-8 border-purple-300 focus:border-purple-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table hiển thị danh sách */}
                    {loading ? (
                        <div className="text-center py-8 text-purple-600">Đang tải...</div>
                    ) : currentItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Không có nhà cung cấp nào
                        </div>
                    ) : (
                        <div className="rounded-md border border-purple-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-purple-50">
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead>Mã NCC</TableHead>
                                        <TableHead>Tên NCC</TableHead>
                                        <TableHead>Người liên hệ</TableHead>
                                        <TableHead>SĐT</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((item, index) => (
                                        <TableRow key={item.id} className="hover:bg-purple-50">
                                            {/* Số thứ tự */}
                                            <TableCell className="font-medium">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.maNhaCungCap || '-'}</TableCell>
                                            <TableCell>{item.tenNhaCungCap}</TableCell>
                                            <TableCell>{item.nguoiLienHe || "-"}</TableCell>
                                            <TableCell>{item.soDienThoai || "-"}</TableCell>
                                            <TableCell>{item.email || "-"}</TableCell>
                                            {/* Badge trạng thái */}
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        item.trangThai === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {item.trangThai === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                                                </div>
                                            </TableCell>
                                            {/* Các nút thao tác (View, Edit & Delete) */}
                                            <TableCell className="text-right space-x-2">
                                                {/* Nút View */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/supplier/view/${item.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                {/* Nút Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/supplier/${item.id}`)}
                                                >
                                                    <Edit className="h-4 w-4 text-purple-600" />
                                                </Button>

                                                {/* Dialog xác nhận xóa */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md bg-white border border-purple-300 rounded-xl shadow-xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-red-600 text-xl font-bold">
                                                                Xác nhận xóa nhà cung cấp
                                                            </DialogTitle>
                                                            <DialogDescription className="text-gray-700 mt-2">
                                                                Bạn chắc chắn muốn xóa nhà cung cấp{" "}
                                                                <span className="font-semibold text-gray-900">"{item.tenNhaCungCap}"</span>?
                                                                <br />
                                                                <span className="text-red-500 font-medium mt-1 block">
                                                                    Hành động này không thể hoàn tác.
                                                                </span>
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter className="sm:justify-start gap-3 mt-6">
                                                            <Button
                                                                variant="outline"
                                                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                                                onClick={() => {
                                                                    setDeleteId(null);           // Đóng dialog
                                                                    navigate("/supplier");       // ← Điều hướng về danh sách
                                                                }}
                                                            >
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                onClick={handleDelete}
                                                                disabled={loading}
                                                            >
                                                                {loading ? "Đang xóa..." : "Xóa"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Phân trang - chuyển hết về bên phải */}
                    {suppliers.length > 0 && (
                        <div className="flex items-center justify-end mt-6 gap-4">
                            {/* Dropdown chọn số dòng hiển thị */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Rows</span>
                                <Select
                                    value={String(itemsPerPage)}
                                    onValueChange={(value) => {
                                        setItemsPerPage(Number(value));
                                        setCurrentPage(1); // Reset về trang 1 khi thay đổi
                                    }}
                                >
                                    <SelectTrigger className="w-[100px] bg-white border border-purple-300 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-purple-300 shadow-lg">
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="30">30</SelectItem>
                                        <SelectItem value="40">40</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Nút Prev - Current Page - Next */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button className="bg-purple-600 text-white cursor-default shadow-md">
                                    {currentPage}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}