import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import Stat from "@/components/dashboard/Stat";
import { ShoppingCart, DollarSign, Truck } from "lucide-react";

export default function DashboardSalesStaff() {

    const [data, setData] = useState(null);

    useEffect(() => {
        dashboardService.getDashboard().then(res => {
            setData(res.data.data);
        });
    }, []);

    if (!data) return null;

    return (

        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Stat
                    icon={<ShoppingCart className="w-5 h-5 text-orange-600" />}
                    label="Đơn bán hôm nay"
                    value={data.totalOrdersToday}
                />

                <Stat
                    icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                    label="Doanh thu hôm nay"
                    value={`${data.revenueToday.toLocaleString()}₫`}
                />

                <Stat
                    icon={<Truck className="w-5 h-5 text-blue-600" />}
                    label="Đơn bán chờ xuất kho"
                    value={data.pendingSaleOrders}
                />

            </section>

        </div>

    )

}