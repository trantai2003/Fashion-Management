import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import Stat from "@/components/dashboard/Stat";
import { ShoppingCart, Clock, Truck } from "lucide-react";

export default function DashboardPurchaseStaff() {

    const [data, setData] = useState(null);

    useEffect(() => {
        dashboardService.getDashboard().then(res => {
            setData(res.data.data);
        });
    }, []);

    if (!data) return null;

    return (

        <div className="lux-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Stat
                    icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
                    label="Đơn mua hôm nay"
                    value={data.purchaseToday}
                />

                <Stat
                    icon={<Clock className="w-5 h-5 text-yellow-600" />}
                    label="Đơn chờ duyệt"
                    value={data.pendingPurchaseOrders}
                />

                <Stat
                    icon={<Truck className="w-5 h-5 text-emerald-600" />}
                    label="Nhà cung cấp"
                    value={data.totalSuppliers}
                />

            </section>

        </div>

    )

}