import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import Stat from "@/components/dashboard/Stat";
import AlertBox from "@/components/dashboard/AlertBox";
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";

export default function DashboardWarehouseManager() {

    const [data, setData] = useState(null);

    useEffect(() => {
        dashboardService.getDashboard().then(res => {
            setData(res.data.data);
        });
    }, []);

    if (!data) return null;

    return (

        <div className="lux-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* STATS */}

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <Stat
                    icon={<Package className="w-5 h-5 text-blue-600" />}
                    label="Tổng sản phẩm"
                    value={data.totalProducts}
                />

                <Stat
                    icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                    label="Tồn kho thấp"
                    value={data.lowStockCount}
                />

                <Stat
                    icon={<ArrowDownToLine className="w-5 h-5 text-emerald-600" />}
                    label="Phiếu nhập hôm nay"
                    value={data.importToday}
                />

                <Stat
                    icon={<ArrowUpFromLine className="w-5 h-5 text-orange-600" />}
                    label="Phiếu xuất hôm nay"
                    value={data.exportToday}
                />

            </section>

            {/* ALERT */}

            <section className="grid lg:grid-cols-3 gap-4">

                <div className="bg-white shadow-md rounded-xl p-5">

                    <div className="text-sm font-semibold text-gray-900">
                        Cảnh báo kho
                    </div>

                    <div className="mt-4 space-y-3">

                        <AlertBox
                            title="Sản phẩm tồn thấp"
                            subtitle={`${data.lowStockCount} sản phẩm`}
                            color="red"
                        />

                        <AlertBox
                            title="Phiếu nhập chờ xử lý"
                            subtitle={`${data.pendingImports} phiếu`}
                            color="yellow"
                        />

                        <AlertBox
                            title="Phiếu xuất chờ xử lý"
                            subtitle={`${data.pendingExports} phiếu`}
                            color="yellow"
                        />

                    </div>

                </div>

            </section>

        </div>

    )
}