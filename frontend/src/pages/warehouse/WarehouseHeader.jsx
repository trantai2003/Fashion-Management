import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

export default function WarehouseHeader({ onAddWarehouse }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
