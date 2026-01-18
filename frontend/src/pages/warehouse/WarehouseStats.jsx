import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Warehouse, CheckCircle2, X, Package } from 'lucide-react';

export default function WarehouseStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng số kho</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Warehouse className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đang hoạt động</p>
                            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Không hoạt động</p>
                            <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <X className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng tồn kho</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.totalStock}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
