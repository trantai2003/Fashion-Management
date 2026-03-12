import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import Stat from "@/components/dashboard/Stat";
import { Package, AlertTriangle } from "lucide-react";

export default function DashboardWarehouseStaff() {

  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard().then(res => {
      setData(res.data.data);
    });
  }, []);

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <Stat
          icon={<Package className="w-5 h-5 text-blue-600" />}
          label="Đơn bán hôm nay"
          value={data.totalOrdersToday}
        />

        <Stat
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          label="Tồn kho thấp"
          value={data.lowStockCount}
        />

      </section>

    </div>
  );
}