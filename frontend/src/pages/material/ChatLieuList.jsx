// src/pages/material/ChatLieuList.jsx
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
// Thay đổi: import toast từ sonner thay vì react-hot-toast
import { toast } from "sonner";
import {
    getAllChatLieu,
    deleteChatLieu,
} from "@/services/chatLieuService";

export default function ChatLieuList() {
    // State management
    const [chatLieus, setChatLieus] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Fetch danh sách chất liệu từ API
    // Pattern: GIỐNG HỆT fetchSuppliers
    const fetchChatLieus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllChatLieu(search);
            // Set data trực tiếp - getAllChatLieu đã trả về array từ response.data.data || []
            setChatLieus(data);
        } catch (err) {
            console.error("Fetch error:", err);
            // Thông báo lỗi đơn giản - GIỐNG supplierService
            toast.error("Không thể tải danh sách chất liệu");
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Load dữ liệu khi component mount hoặc search thay đổi
    useEffect(() => {
        fetchChatLieus();
    }, [fetchChatLieus]);

    // Xử lý xóa chất liệu
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteChatLieu(deleteId);
            // Thay đổi: toast.success từ sonner
            toast.success("Xóa chất liệu thành công");
            fetchChatLieus(); // Reload danh sách
        } catch (err) {
            // Thay đổi: toast.error từ sonner
            toast.error(err.response?.data?.message || "Xóa thất bại");
        } finally {
            setDeleteId(null); // Reset deleteId
        }
    };

    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = chatLieus.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(chatLieus.length / itemsPerPage);

    return (
        <div className="container mx-auto py-10">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                {/* Header với tiêu đề và nút thêm mới */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">
                        Danh sách Chất liệu
                    </CardTitle>
                    <Button
                        onClick={() => navigate("/material/new")}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm chất liệu
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
                            Không có chất liệu nào
                        </div>
                    ) : (
                        <div className="rounded-md border border-purple-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-purple-50">
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Tên chất liệu</TableHead>
                                        <TableHead>Mô tả</TableHead>
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
                                            <TableCell className="font-medium">{item.maChatLieu || '-'}</TableCell>
                                            <TableCell>{item.tenChatLieu}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.moTa || "-"}
                                            </TableCell>
                                            {/* Badge trạng thái */}
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        item.trangThai ?? true ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {item.trangThai ?? true ? "Hoạt động" : "Ngừng hoạt động"}
                                                </div>
                                            </TableCell>
                                            {/* Các nút thao tác (View, Edit & Delete) */}
                                            <TableCell className="text-right space-x-2">
                                                {/* Nút Xem chi tiết */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/material/view/${item.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                {/* Nút Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/material/${item.id}`)}
                                                    title="Chỉnh sửa"
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
                                                                Xác nhận xóa chất liệu
                                                            </DialogTitle>
                                                            <DialogDescription className="text-gray-700 mt-2">
                                                                Bạn chắc chắn muốn xóa chất liệu{" "}
                                                                <span className="font-semibold text-gray-900">"{item.tenChatLieu}"</span>?
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
                                                                onClick={() => setDeleteId(null)}
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

                    {/* Phân trang - bên phải */}
                    {chatLieus.length > 0 && (
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