import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

export default function WarehouseHeader({ onAddWarehouse }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
                    <p className="text-gray-600">Quản lý thông tin và vận hành các kho hàng</p>
                </div>
            </div>
            <Button
                onClick={onAddWarehouse}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
                <Plus className="w-4 h-4 mr-2" />
                Thêm kho mới
            </Button>
        </div>
    );
}
