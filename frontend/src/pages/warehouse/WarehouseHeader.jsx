import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

export default function WarehouseHeader({ onAddWarehouse }) {
    return (
        <div className="flex items-center justify-end">
            <Button
                onClick={onAddWarehouse}
                className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all duration-200"
            >
                <Plus className="w-4 h-4 mr-2" />
                Thêm kho mới
            </Button>
        </div>
    );
}
