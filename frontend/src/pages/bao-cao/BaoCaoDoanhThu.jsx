import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  DollarSign,
  Package,
  Percent,
  Search,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


// ───────────────── API ─────────────────
const API_BASE = "http://localhost:8080/api/v1";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
});

async function fetchKhoList() {
  const res = await fetch(`${API_BASE}/kho/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      filters: [],
      sorts: [],
      page: 0,
      size: 100,
    }),
  });

  const json = await res.json();
  return json?.data?.content ?? [];
}

async function fetchDoanhThu(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") query.set(k, v);
  });

  const res = await fetch(
    `${API_BASE}/admin/dashboard/bao-cao/doanh-thu?${query}`,
    { headers: getAuthHeader() }
  );

  const json = await res.json();
  return json?.data ?? [];
}


// ───────────────── HELPERS ─────────────────
const fmt = (n) => {
  const num = Number(n || 0);

  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " tr";

  return num.toLocaleString("vi-VN");
};


// ───────────────── KPI CARD ─────────────────
function KpiCard({ icon: Icon, label, value }) {
  return (
    <Card className="border bg-white">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>

        <div className="p-3 rounded-xl bg-purple-100">
          <Icon size={24} className="text-purple-600" />
        </div>
      </CardContent>
    </Card>
  );
}


// ───────────────── COMPONENT ─────────────────
export default function BaoCaoDoanhThu() {

  const [loai, setLoai] = useState("thang");
  const [khoId, setKhoId] = useState("ALL");

  const [khoList, setKhoList] = useState([]);
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [nam, setNam] = useState(new Date().getFullYear());
  const [thang, setThang] = useState(new Date().getMonth() + 1);

  const [tuNam, setTuNam] = useState(new Date().getFullYear() - 4);
  const [denNam, setDenNam] = useState(new Date().getFullYear());

  const [tuNgay, setTuNgay] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });

  const [denNgay, setDenNgay] = useState(
    new Date().toISOString().slice(0, 10)
  );


  // ───── LOAD KHO ─────
  useEffect(() => {
    fetchKhoList().then((list) => {
      setKhoList(list.filter((k) => k.trangThai !== 0));
    });
  }, []);


  const buildParams = useCallback(() => {

    const base = {
      loai,
      ...(khoId !== "ALL" ? { khoId } : {}),
    };

    if (loai === "ngay")
      return { ...base, tuNgay, denNgay };

    if (loai === "nam")
      return { ...base, tuNam, denNam };

    if (loai === "so_sanh")
      return { ...base, nam, thang };

    return { ...base, nam };

  }, [loai, khoId, tuNgay, denNgay, nam, tuNam, denNam, thang]);


  const loadData = useCallback(async () => {

    setLoading(true);

    try {
      const result = await fetchDoanhThu(buildParams());
      setData(result);
    } catch {
      setData([]);
    }

    setLoading(false);

  }, [buildParams]);


  useEffect(() => {
    loadData();
  }, [loai, khoId]);


  const chartData = data.map((d) => ({
    ...d,
    doanhThu: Number(d.doanhThu || 0),
    giaVon: Number(d.giaVon || 0),
    loiNhuan: Number(d.loiNhuan || 0),
    soLuongDon: Number(d.soLuongDon || 0),
    tyLeLaiGop: Number(d.tyLeLaiGop || 0),
  }));


  const totalDoanhThu = chartData.reduce((s, d) => s + d.doanhThu, 0);
  const totalLoiNhuan = chartData.reduce((s, d) => s + d.loiNhuan, 0);
  const totalDon = chartData.reduce((s, d) => s + d.soLuongDon, 0);

  const avgTyLe = chartData.length
    ? (
        chartData.reduce((s, d) => s + d.tyLeLaiGop, 0) /
        chartData.length
      ).toFixed(2)
    : 0;


  return (
    <div className="max-w-[1500px] mx-auto p-6 space-y-6">


      {/* FILTER */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end p-6">

          <Tabs value={loai} onValueChange={setLoai}>
            <TabsList>
              <TabsTrigger value="ngay">Ngày</TabsTrigger>
              <TabsTrigger value="thang">Tháng</TabsTrigger>
              <TabsTrigger value="nam">Năm</TabsTrigger>
              <TabsTrigger value="so_sanh">So sánh</TabsTrigger>
            </TabsList>
          </Tabs>


          {loai === "ngay" && (
            <>
              <Input
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />

              <Input
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </>
          )}


          {(loai === "thang" || loai === "so_sanh") && (
            <Input
              type="number"
              value={nam}
              onChange={(e) => setNam(e.target.value)}
              className="w-[120px]"
            />
          )}


          {loai === "nam" && (
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={tuNam}
                onChange={(e) => setTuNam(e.target.value)}
                className="w-[120px]"
                placeholder="Từ năm"
              />

              <span className="text-gray-400">→</span>

              <Input
                type="number"
                value={denNam}
                onChange={(e) => setDenNam(e.target.value)}
                className="w-[120px]"
                placeholder="Đến năm"
              />
            </div>
          )}


          {loai === "so_sanh" && (
            <Input
              type="number"
              value={thang}
              onChange={(e) => setThang(e.target.value)}
              className="w-[90px]"
            />
          )}


          <Select value={khoId} onValueChange={setKhoId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tất cả kho" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">Tất cả kho</SelectItem>

              {khoList.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>
                  [{k.maKho}] {k.tenKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Button
            onClick={loadData}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <RefreshCw className="animate-spin mr-2" size={16} />
            ) : (
              <Search className="mr-2" size={16} />
            )}
            Xem báo cáo
          </Button>

        </CardContent>
      </Card>


      {/* KPI */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <KpiCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={fmt(totalDoanhThu)}
        />

        <KpiCard
          icon={TrendingUp}
          label="Lợi nhuận"
          value={fmt(totalLoiNhuan)}
        />

        <KpiCard
          icon={Percent}
          label="Tỷ lệ lãi gộp"
          value={avgTyLe + "%"}
        />

        <KpiCard
          icon={Package}
          label="Tổng đơn hàng"
          value={totalDon}
        />

      </div>


      {/* CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
          <CardDescription>
            Phân tích doanh thu & lợi nhuận
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[420px]">

          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="nhanThoiGian" />

              <YAxis yAxisId="tien" tickFormatter={fmt} />

              <Tooltip />

              <Legend />

              <Bar
                yAxisId="tien"
                dataKey="giaVon"
                name="Giá vốn"
                stackId="a"
                fill="#e5e7eb"
              />

              <Bar
                yAxisId="tien"
                dataKey="loiNhuan"
                name="Lợi nhuận"
                stackId="a"
                fill="#a78bfa"
              />

              <Line
                yAxisId="tien"
                dataKey="doanhThu"
                name="Doanh thu"
                stroke="#9333ea"
                strokeWidth={3}
              />

            </ComposedChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>


      {/* TABLE */}
      <Card>

        <CardHeader>
          <CardTitle>Chi tiết số liệu</CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Thời kỳ</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Giá vốn</TableHead>
                <TableHead className="text-right">Lợi nhuận</TableHead>
                <TableHead className="text-right">Tỷ lệ</TableHead>
                <TableHead className="text-right">Số đơn</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {chartData.map((row, i) => (
                <TableRow key={i}>

                  <TableCell>{row.nhanThoiGian}</TableCell>

                  <TableCell className="text-right text-purple-700 font-semibold">
                    {fmt(row.doanhThu)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(row.giaVon)}
                  </TableCell>

                  <TableCell className="text-right text-purple-600 font-semibold">
                    {fmt(row.loiNhuan)}
                  </TableCell>

                  <TableCell className="text-right">
                    {row.tyLeLaiGop.toFixed(2)}%
                  </TableCell>

                  <TableCell className="text-right">
                    {row.soLuongDon}
                  </TableCell>

                </TableRow>
              ))}

            </TableBody>

            <TableFooter>
              <TableRow>

                <TableCell className="font-semibold">Tổng</TableCell>

                <TableCell className="text-right text-purple-700 font-bold">
                  {fmt(totalDoanhThu)}
                </TableCell>

                <TableCell />

                <TableCell className="text-right text-purple-600 font-bold">
                  {fmt(totalLoiNhuan)}
                </TableCell>

                <TableCell className="text-right">
                  {avgTyLe}%
                </TableCell>

                <TableCell className="text-right">
                  {totalDon}
                </TableCell>

              </TableRow>
            </TableFooter>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
}