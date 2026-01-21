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
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast"; // Nếu dùng Shadcn toast → thay bằng useToast ở dưới
import {
    getAllChatLieu,
    deleteChatLieu,
} from "@/services/chatLieuService";

export default function ChatLieuList() {
    const [chatLieus, setChatLieus] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchChatLieus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllChatLieu(search);
            setChatLieus(data || []);
        } catch (error) {
            toast.error("Không thể tải danh sách chất liệu");
            console.error("Lỗi khi tải danh sách chất liệu:", error);
        } finally {
            setLoading(false);
        }
    }, [search]); // dependency là search → hàm chỉ re-create khi search thay đổi

    useEffect(() => {
        fetchChatLieus();
    }, [fetchChatLieus]); // giờ phụ thuộc vào hàm đã memoized → ESLint không cảnh báo

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa chất liệu này?")) return;

        try {
            await deleteChatLieu(id);
            toast.success("Xóa chất liệu thành công");
            await fetchChatLieus(); // await để đảm bảo reload xong trước khi tiếp tục
        } catch (error) {
            toast.error("Xóa thất bại");
            console.error("Lỗi khi xóa chất liệu:", error);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Danh sách Chất liệu</CardTitle>
                    <Button onClick={() => navigate("/material/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm chất liệu
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm theo mã hoặc tên..."
                                className="w-full rounded-lg bg-background pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Đang tải...</div>
                    ) : chatLieus.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Không có chất liệu nào
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Tên chất liệu</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chatLieus.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.maChatLieu || '-'}</TableCell>
                                            <TableCell>{item.tenChatLieu}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.moTa || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        item.trangThai ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {item.trangThai ? "Hoạt động" : "Ngừng"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/material/${item.id}`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}