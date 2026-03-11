import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  ReferenceLine,
} from "recharts";

import {
  Users,
  UserPlus,
  Repeat,
  TrendingUp,
  Search,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";


// API
const BASE_URL =
  "http://localhost:8080/api/v1/admin/dashboard/bao-cao/khach-hang";

const getToken = () =>
  localStorage.getItem("access_token") ?? "";


// helpers
const fmt = (n) =>
  n != null ? Number(n).toLocaleString("vi-VN") : "—";


const today = new Date();
const thisYear = today.getFullYear();
const thisMonth = today.getMonth() + 1;

const defaultTuNgay = `${thisYear}-${String(
  thisMonth
).padStart(2, "0")}-01`;

const defaultDenNgay =
  today.toISOString().split("T")[0];


// build query
function buildParams({
  loai,
  nam,
  thang,
  tuNam,
  denNam,
  tuNgay,
  denNgay,
  khoId,
}) {

  const p = new URLSearchParams();

  if (loai) p.set("loai", loai);

  if (loai === "ngay") {
    if (tuNgay) p.set("tuNgay", tuNgay);
    if (denNgay) p.set("denNgay", denNgay);
  }

  if (loai === "thang" || loai === "tuan") {
    if (nam != null) p.set("nam", nam);
  }

  if (loai === "nam") {
    if (tuNam != null) p.set("tuNam", tuNam);
    if (denNam != null) p.set("denNam", denNam);
  }

  if (loai === "so_sanh") {
    if (nam != null) p.set("nam", nam);
    if (thang != null) p.set("thang", thang);
  }

  if (khoId) p.set("khoId", khoId);

  return p.toString();
}


// KPI CARD
function KpiCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <h3 className="text-2xl font-bold">
            {fmt(value)}
          </h3>
        </div>

        <div className="p-3 rounded-xl bg-purple-100">
          <Icon className="text-purple-600" />
        </div>
      </CardContent>
    </Card>
  );
}



export default function KhachHangReport() {

  const [loai, setLoai] = useState("thang");

  const [nam, setNam] = useState(null);
  const [thang, setThang] = useState(null);

  const [tuNam, setTuNam] = useState(null);
  const [denNam, setDenNam] = useState(null);

  const [tuNgay, setTuNgay] = useState(defaultTuNgay);
  const [denNgay, setDenNgay] = useState(defaultDenNgay);

  const [khoId, setKhoId] = useState("");

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("tong_hop");


  const fetchData = useCallback(async () => {

    setLoading(true);

    const params = buildParams({
      loai,
      nam,
      thang,
      tuNam,
      denNam,
      tuNgay,
      denNgay,
      khoId,
    });

    const res = await fetch(
      `${BASE_URL}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const json = await res.json();

    setData(Array.isArray(json?.data) ? json.data : []);

    setLoading(false);

  }, [
    loai,
    nam,
    thang,
    tuNam,
    denNam,
    tuNgay,
    denNgay,
    khoId,
  ]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const tongMoi = data.reduce(
    (s, d) => s + (Number(d.soKhachMoi) || 0),
    0
  );

  const tongQuayLai = data.reduce(
    (s, d) => s + (Number(d.soKhachQuayLai) || 0),
    0
  );

  const tongMua = data.reduce(
    (s, d) => s + (Number(d.tongKhachMua) || 0),
    0
  );



  return (
    <div className="max-w-[1500px] mx-auto p-6 space-y-6">
      {/* FILTER */}

      <div className="flex flex-wrap gap-4 items-end p-6">
        <Tabs value={loai} onValueChange={setLoai}>
          <TabsList>
            <TabsTrigger value="ngay">Ngày</TabsTrigger>
            <TabsTrigger value="thang">Tháng</TabsTrigger>
            <TabsTrigger value="nam">Năm</TabsTrigger>
            <TabsTrigger value="so_sanh">
              So sánh
            </TabsTrigger>
          </TabsList>
        </Tabs>


        {loai === "ngay" && (
          <>
            <Input
              type="date"
              value={tuNgay}
              onChange={(e) =>
                setTuNgay(e.target.value)
              }
            />

            <Input
              type="date"
              value={denNgay}
              onChange={(e) =>
                setDenNgay(e.target.value)
              }
            />
          </>
        )}


        {(loai === "thang" ||
          loai === "so_sanh") && (
            <Input
              type="number"
              placeholder="Năm"
              value={nam ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setNam(v === "" ? null : Number(v));
              }}
              className="w-[120px]"
            />
          )}


        {loai === "nam" && (
          <div className="flex gap-2">

            <Input
              type="number"
              placeholder="Từ năm"
              value={tuNam ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setTuNam(v === "" ? null : Number(v));
              }}
              className="w-[120px]"
            />

            <Input
              type="number"
              placeholder="Đến năm"
              value={denNam ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setDenNam(v === "" ? null : Number(v));
              }}
              className="w-[120px]"
            />

          </div>
        )}


        {loai === "so_sanh" && (
          <Input
            type="number"
            placeholder="Tháng"
            value={thang ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setThang(v === "" ? null : Number(v));
            }}
            className="w-[90px]"
          />
        )}


        <Select
          value={khoId || "ALL"}
          onValueChange={(v) => setKhoId(v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả kho" />
          </SelectTrigger>

          <SelectContent>

            <SelectItem value="ALL">
              Tất cả kho
            </SelectItem>

            <SelectItem value="1">
              KHO01 – Hà Nội
            </SelectItem>

            <SelectItem value="2">
              KHO02 – Miền Nam
            </SelectItem>

          </SelectContent>
        </Select>


        <Button
          onClick={fetchData}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <RefreshCw className="animate-spin mr-2" />
          ) : (
            <Search className="mr-2" />
          )}

          Xem báo cáo
        </Button>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">

        <KpiCard
          icon={UserPlus}
          label="Khách mới"
          value={tongMoi}
        />

        <KpiCard
          icon={Repeat}
          label="Khách quay lại"
          value={tongQuayLai}
        />

        <KpiCard
          icon={TrendingUp}
          label="Tổng khách mua"
          value={tongMua}
        />

      </div>



      {/* CHART */}
      <Card>

        <CardHeader>
          <CardTitle>
            Phân tích khách hàng
          </CardTitle>

          <CardDescription>
            Xu hướng khách mới & quay lại
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[420px]">

          <ResponsiveContainer width="100%" height="100%">

            <ComposedChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="nhanThoiGian" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="soKhachMoi"
                fill="#a78bfa"
                name="Khách mới"
              />

              <Bar
                dataKey="soKhachQuayLai"
                fill="#c4b5fd"
                name="Quay lại"
              />

              <Line
                dataKey="tongKhachMua"
                stroke="#9333ea"
                strokeWidth={3}
                name="Tổng khách"
              />

            </ComposedChart>

          </ResponsiveContainer>

        </CardContent>

      </Card>



      {/* TABLE */}
      <Card>

        <CardHeader>
          <CardTitle>
            Chi tiết dữ liệu
          </CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Kỳ</TableHead>

                <TableHead className="text-right">
                  Khách mới
                </TableHead>

                <TableHead className="text-right">
                  Quay lại
                </TableHead>

                <TableHead className="text-right">
                  Tổng mua
                </TableHead>

                <TableHead className="text-right">
                  Tích lũy
                </TableHead>

                <TableHead className="text-right">
                  Tăng trưởng
                </TableHead>

              </TableRow>

            </TableHeader>


            <TableBody>

              {data.map((row, i) => (

                <TableRow key={i}>

                  <TableCell>
                    {row.nhanThoiGian}
                  </TableCell>

                  <TableCell className="text-right text-purple-700 font-semibold">
                    {fmt(row.soKhachMoi)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(row.soKhachQuayLai)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(row.tongKhachMua)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(row.tichLuyKhachMoi)}
                  </TableCell>

                  <TableCell className="text-right">

                    {row.tyLeTangTruong != null ? (

                      <Badge className="bg-purple-100 text-purple-700">
                        {row.tyLeTangTruong.toFixed(1)}%
                      </Badge>

                    ) : (
                      "—"
                    )}

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
}