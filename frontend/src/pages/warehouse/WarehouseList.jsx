import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import WarehouseCard from './WarehouseCard';
import { Warehouse } from 'lucide-react';

export default function WarehouseList({ warehouses, onView, onEdit, onDelete }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
                <WarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export function WarehouseEmptyState() {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <Warehouse className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kho</h3>
                <p className="text-gray-600">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            </CardContent>
        </Card>
    );
}
