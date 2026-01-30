
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { mauSacService, sizeService } from "@/services/attributeService";
import { toast } from "sonner";

const ColorSizeManagement = () => {
    const [activeTab, setActiveTab] = useState('color');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Data State
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [totalColors, setTotalColors] = useState(0);
    const [totalSizes, setTotalSizes] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        tenMau: '',
        maMau: '', // Code M00x
        maMauHex: '#000000', // Hex #...
        maSize: '',
        tenSize: '',
        loaiSize: '',
        thuTuSapXep: '',
        moTa: ''
    });

    const fetchColors = async () => {
        try {
            const res = await mauSacService.filter({ page: 0, size: 100, filters: [] });
            if (res.status === 200) {
                setColors(res.data.content);
                setTotalColors(res.data.totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch colors", error);
            toast.error("Không thể tải danh sách màu");
        }
    };

    const fetchSizes = async () => {
        try {
            const res = await sizeService.filter({ page: 0, size: 100, filters: [] });
            if (res.status === 200) {
                setSizes(res.data.content);
                setTotalSizes(res.data.totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch sizes", error);
            toast.error("Không thể tải danh sách size");
        }
    };

    useEffect(() => {
        fetchColors();
        fetchSizes();
    }, []);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (item) {
            if (activeTab === 'color') {
                setFormData({
                    tenMau: item.tenMau,
                    maMau: item.maMau || '',
                    maMauHex: item.maMauHex || '#000000',
                });
            } else {
                setFormData({
                    maSize: item.maSize || '',
                    tenSize: item.tenSize || '',
                    loaiSize: item.loaiSize || '',
                    thuTuSapXep: item.thuTuSapXep || '',
                    moTa: item.moTa || '',
                });
            }
        } else {
            if (activeTab === 'color') {
                setFormData({ tenMau: '', maMau: '', maMauHex: '#000000' });
            } else {
                setFormData({ maSize: '', tenSize: '', loaiSize: '', thuTuSapXep: '', moTa: '' });
            }
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            let res;
            if (activeTab === 'color') {
                res = await mauSacService.delete(itemToDelete.id);
            } else {
                res = await sizeService.delete(itemToDelete.id);
            }

            if (res.status === 200) {
                toast.success("Xóa thành công");
                if (activeTab === 'color') fetchColors();
                else fetchSizes();
            } else {
                toast.error(res.message || "Xóa thất bại");
            }
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Có lỗi xảy ra khi xóa");
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    const handleSubmit = async () => {
        // Validation can be added here
        try {
            let res;
            if (activeTab === 'color') {
                const payload = { ...formData };
                if (modalMode === 'add') {
                    res = await mauSacService.create(payload);
                } else {
                    res = await mauSacService.update({ id: selectedItem.id, ...payload });
                }
            } else {
                const payload = { ...formData };
                if (modalMode === 'add') {
                    res = await sizeService.create(payload);
                } else {
                    res = await sizeService.update({ id: selectedItem.id, ...payload });
                }
            }

            if (res.status === 200) {
                toast.success(modalMode === 'add' ? "Thêm mới thành công" : "Cập nhật thành công");
                if (activeTab === 'color') fetchColors();
                else fetchSizes();
                handleCloseModal();
            } else {
                toast.error(res.message || "Thao tác thất bại");
            }
        } catch (error) {
            console.error("Submit failed", error);
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                
                <Button onClick={() => handleOpenModal('add')} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    {activeTab === 'color' ? 'Thêm màu mới' : 'Thêm size mới'}
                </Button>
            </div>

            <Tabs defaultValue="color" onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="color">Màu sắc</TabsTrigger>
                    <TabsTrigger value="size">Kích cỡ</TabsTrigger>
                </TabsList>

                <TabsContent value="color" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Mã màu</TableHead>
                                        <TableHead>Tên màu</TableHead>
                                        <TableHead>Mã màu (Hex)</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {colors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">Không có dữ liệu</TableCell>
                                        </TableRow>
                                    ) : (
                                        colors.map((color, index) => (
                                            <TableRow key={color.id}>
                                                <TableCell>{color.id}</TableCell>
                                                <TableCell>{color.maMau}</TableCell>
                                                <TableCell className="font-medium">{color.tenMau}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded border border-gray-200"
                                                            style={{ backgroundColor: color.maMauHex }}
                                                        />
                                                        {color.maMauHex}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{color.ngayTao ? new Date(color.ngayTao).toLocaleDateString("vi-VN") : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', color)}>
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', color)}>
                                                            <Pencil className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(color)}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="size" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Mã size</TableHead>
                                        <TableHead>Tên size</TableHead>
                                        <TableHead>Loại size</TableHead>
                                        <TableHead>Thứ tự</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sizes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-4">Không có dữ liệu</TableCell>
                                        </TableRow>
                                    ) : (
                                        sizes.map((size, index) => (
                                            <TableRow key={size.id}>
                                                <TableCell>{size.id}</TableCell>
                                                <TableCell>{size.maSize}</TableCell>
                                                <TableCell className="font-medium">{size.tenSize}</TableCell>
                                                <TableCell>{size.loaiSize}</TableCell>
                                                <TableCell>{size.thuTuSapXep}</TableCell>
                                                <TableCell>{size.moTa}</TableCell>
                                                <TableCell>{size.ngayTao ? new Date(size.ngayTao).toLocaleDateString("vi-VN") : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', size)}>
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', size)}>
                                                            <Pencil className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(size)}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === 'add' ? (activeTab === 'color' ? 'Thêm màu mới' : 'Thêm size mới') :
                                modalMode === 'edit' ? (activeTab === 'color' ? 'Chỉnh sửa màu' : 'Chỉnh sửa size') :
                                    (activeTab === 'color' ? 'Chi tiết màu' : 'Chi tiết size')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {activeTab === 'color' ? (
                            <>
                                <div className="grid gap-2">
                                    <Label>Tên màu <span className="text-red-500">*</span></Label>
                                    <Input
                                        disabled={modalMode === 'view'}
                                        value={formData.tenMau || ''}
                                        onChange={(e) => setFormData({ ...formData, tenMau: e.target.value })}
                                        placeholder="Nhập tên màu"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Mã màu (Code example: M001) <span className="text-red-500">*</span></Label>
                                    <Input
                                        disabled={modalMode === 'view'}
                                        value={formData.maMau || ''}
                                        onChange={(e) => setFormData({ ...formData, maMau: e.target.value })}
                                        placeholder="Nhập mã màu (VD: M001)"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Mã màu Hex <span className="text-red-500">*</span></Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="h-10 w-16 p-1 border rounded cursor-pointer"
                                            value={formData.maMauHex || '#000000'}
                                            disabled={modalMode === 'view'}
                                            onChange={(e) => setFormData({ ...formData, maMauHex: e.target.value })}
                                        />
                                        <Input
                                            disabled={modalMode === 'view'}
                                            value={formData.maMauHex || '#000000'}
                                            onChange={(e) => setFormData({ ...formData, maMauHex: e.target.value })}
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label>Mã size <span className="text-red-500">*</span></Label>
                                    <Input
                                        disabled={modalMode === 'view'}
                                        value={formData.maSize || ''}
                                        onChange={(e) => setFormData({ ...formData, maSize: e.target.value })}
                                        placeholder="Nhập mã size (S, M, L...)"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tên size <span className="text-red-500">*</span></Label>
                                    <Input
                                        disabled={modalMode === 'view'}
                                        value={formData.tenSize || ''}
                                        onChange={(e) => setFormData({ ...formData, tenSize: e.target.value })}
                                        placeholder="Nhập tên size (Size S, Size M...)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Loại size</Label>
                                        <Input
                                            disabled={modalMode === 'view'}
                                            value={formData.loaiSize || ''}
                                            onChange={(e) => setFormData({ ...formData, loaiSize: e.target.value })}
                                            placeholder="VD: chu"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Thứ tự sắp xếp</Label>
                                        <Input
                                            type="number"
                                            disabled={modalMode === 'view'}
                                            value={formData.thuTuSapXep || ''}
                                            onChange={(e) => setFormData({ ...formData, thuTuSapXep: e.target.value })}
                                            placeholder="VD: 1"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Mô tả</Label>
                                    <Input
                                        disabled={modalMode === 'view'}
                                        value={formData.moTa || ''}
                                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                        placeholder="Mô tả"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        {modalMode !== 'view' ? (
                            <>
                                <Button variant="outline" onClick={handleCloseModal}>Hủy</Button>
                                <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {modalMode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleCloseModal}>Đóng</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Bạn có chắc chắn muốn xóa {activeTab === 'color' ? 'màu' : 'size'} <span className="font-bold">{itemToDelete?.tenMau || itemToDelete?.tenSize}</span>?</p>
                        <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Hủy</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ColorSizeManagement;
