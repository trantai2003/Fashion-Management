// frontend/src/pages/material/ChatLieuDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import {
    getChatLieuById,
    createChatLieu,
    updateChatLieu,
} from '@/services/chatLieuService';
import { toast } from 'sonner';

const formSchema = z.object({
    maChatLieu: z.string().min(2, { message: 'Mã chất liệu ít nhất 2 ký tự' }),
    tenChatLieu: z.string().min(2, { message: 'Tên chất liệu ít nhất 2 ký tự' }),
    moTa: z.string().optional(),
    trangThai: z.boolean().default(true),
});

export default function ChatLieuDetail() {
    const { id } = useParams(); // nếu có id → edit, không có → create
    const navigate = useNavigate();
    const isEdit = !!id;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maChatLieu: '',
            tenChatLieu: '',
            moTa: '',
            trangThai: true,
        },
    });

    useEffect(() => {
        if (isEdit) {
            const fetchData = async () => {
                try {
                    const data = await getChatLieuById(id);
                    form.reset({
                        maChatLieu: data.maChatLieu || '',
                        tenChatLieu: data.tenChatLieu || '',
                        moTa: data.moTa || '',
                        trangThai: !!data.trangThai,
                    });
                } catch (err) {
                    toast.error('Không thể tải thông tin chất liệu');
                    navigate('/material');
                }
            };
            fetchData();
        }
    }, [id, form, navigate, isEdit]);

    const onSubmit = async (values) => {
        try {
            if (isEdit) {
                await updateChatLieu(id, values);
                toast.success('Cập nhật chất liệu thành công');
            } else {
                await createChatLieu(values);
                toast.success('Thêm chất liệu mới thành công');
            }
            navigate('/material');
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-2xl">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate('/material')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {isEdit ? 'Chỉnh sửa Chất liệu' : 'Thêm Chất liệu mới'}
                    </CardTitle>
                    <CardDescription>
                        {isEdit
                            ? 'Cập nhật thông tin chất liệu hiện tại'
                            : 'Nhập thông tin để tạo chất liệu mới'}
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="maChatLieu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã chất liệu</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: COTTON, POLY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tenChatLieu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên chất liệu</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Cotton 100%, Polyester" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="moTa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Mô tả thêm về chất liệu (tùy chọn)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="trangThai"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormLabel>Trạng thái hoạt động</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/material')}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.formState.isSubmitting
                                    ? 'Đang lưu...'
                                    : isEdit
                                        ? 'Cập nhật'
                                        : 'Thêm mới'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}