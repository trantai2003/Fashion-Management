import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

const VARIANT_CONFIG = {
    danger: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
        title: "Xác nhận xóa"
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-yellow-500",
        confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
        title: "Cảnh báo"
    },
    info: {
        icon: Info,
        iconColor: "text-blue-500",
        confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        title: "Thông tin"
    },
    success: {
        icon: CheckCircle2,
        iconColor: "text-green-500",
        confirmButtonClass: "bg-green-600 hover:bg-green-700 text-white",
        title: "Xác nhận"
    }
};


export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "danger",
    isLoading = false,
}) {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;
    const Icon = config.icon;

    const handleConfirm = async () => {
        await onConfirm?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 rounded-xl shadow-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gray-50`}>
                            <Icon className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            {title || config.title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-600 pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="border-gray-300"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={config.confirmButtonClass}
                    >
                        {isLoading ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Đang xử lý...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
