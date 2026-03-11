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
  ReferenceLine,
} from "recharts";

const BASE_URL =
  "http://localhost:8080/api/v1/admin/dashboard/bao-cao/nhat-ky-nhap-xuat";
const getToken = () => localStorage.getItem("access_token") ?? "";

const today = new Date();
const thisYear = today.getFullYear();
const thisMonth = today.getMonth() + 1;

const pad = (n) => String(n).padStart(2, "0");

const defaultTuNgay = `${thisYear}-${pad(thisMonth)}-01`;
const defaultDenNgay = today.toISOString().split("T")[0];

const fmtSL = (n) => (n != null ? Number(n).toLocaleString("vi-VN") : "—");

const fmtVND = (n) =>
  n != null
    ? Number(n).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      })
    : "—";

function buildParams({
  loai,
  nam,
  thang,
  tuNam,
  denNam,
  tuNgay,
  denNgay,
  khoId,
  loaiGiaoDich,
}) {
  const p = new URLSearchParams({ loai });

  if (loai === "ngay" || loai === "chi_tiet" || loai === "theo_kho") {
    p.set("tuNgay", tuNgay);
    p.set("denNgay", denNgay);
  } else if (loai === "tuan" || loai === "thang") {
    p.set("nam", nam);
  } else if (loai === "nam") {
    p.set("tuNam", tuNam);
    p.set("denNam", denNam);
  } else if (loai === "so_sanh") {
    p.set("nam", nam);
    p.set("thang", thang);
  }

  if (khoId) p.set("khoId", khoId);
  if (loaiGiaoDich) p.set("loaiGiaoDich", loaiGiaoDich);

  return p.toString();
}

export default function NhatKyNhapXuat() {
  const [loai, setLoai] = useState("thang");
  const [nam, setNam] = useState(thisYear);
  const [thang, setThang] = useState(thisMonth);

  const [tuNam, setTuNam] = useState(thisYear - 4);
  const [denNam, setDenNam] = useState(thisYear);

  const [tuNgay, setTuNgay] = useState(defaultTuNgay);
  const [denNgay, setDenNgay] = useState(defaultDenNgay);

  const [khoId, setKhoId] = useState("");
  const [loaiGiaoDich, setLoaiGiaoDich] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = buildParams({
        loai,
        nam,
        thang,
        tuNam,
        denNam,
        tuNgay,
        denNgay,
        khoId,
        loaiGiaoDich,
      });

      const token = getToken();

      const res = await fetch(`${BASE_URL}?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();

      setData(Array.isArray(json) ? json : json.data ?? []);
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    loai,
    nam,
    thang,
    tuNam,
    denNam,
    tuNgay,
    denNgay,
    khoId,
    loaiGiaoDich,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpi = data.reduce(
    (acc, d) => ({
      tongNhap: acc.tongNhap + (Number(d.tongNhap) || 0),
      tongXuat: acc.tongXuat + (Number(d.tongXuat) || 0),
      tongGtrNhap: acc.tongGtrNhap + (Number(d.tongGiaTriNhap) || 0),
      tongGtrXuat: acc.tongGtrXuat + (Number(d.tongGiaTriXuat) || 0),
    }),
    {
      tongNhap: 0,
      tongXuat: 0,
      tongGtrNhap: 0,
      tongGtrXuat: 0,
    }
  );

  const loaiLabels = {
    ngay: "Theo Ngày",
    tuan: "Theo Tuần",
    thang: "Theo Tháng",
    nam: "Theo Năm",
    so_sanh: "So sánh kỳ",
    chi_tiet: "Chi tiết GD",
    theo_kho: "Theo Kho",
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-10">

      {/* HEADER */}

      <div className="border-b border-gray-200 bg-white px-10 py-8">

        <div className="flex items-start justify-end flex-wrap gap-4 mb-6">

          {/* SELECT */}

          <div className="flex gap-4 flex-wrap">

            <div className="flex flex-col text-xs">

              <span className="text-gray-500 mb-1">Kho</span>

              <select
                className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
                value={khoId}
                onChange={(e) => setKhoId(e.target.value)}
              >
                <option value="">Tất cả kho</option>
                <option value="1">KHO01 – Hà Nội</option>
                <option value="2">KHO02 – Miền Nam</option>
                <option value="3">KHO03 – Miền Trung</option>
                <option value="4">KHO04 – Ngoại thành</option>
              </select>

            </div>

            <div className="flex flex-col text-xs">

              <span className="text-gray-500 mb-1">Loại GD</span>

              <select
                className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
                value={loaiGiaoDich}
                onChange={(e) => setLoaiGiaoDich(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="nhap_kho">Nhập kho</option>
                <option value="xuat_kho">Xuất kho</option>
                <option value="chuyen_kho">Chuyển kho</option>
                <option value="dieu_chinh">Điều chỉnh</option>
              </select>

            </div>

          </div>

        </div>

        {/* FILTER TYPE */}

        <div className="flex flex-wrap gap-2 items-center">

          {Object.entries(loaiLabels).map(([key, label]) => (

            <button
              key={key}
              onClick={() => setLoai(key)}
              className={`px-3 py-1 text-sm rounded border
              ${
                loai === key
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              {label}
            </button>

          ))}

          <div className="ml-auto flex gap-2 items-center flex-wrap">

            {(loai === "ngay" || loai === "chi_tiet" || loai === "theo_kho") && (
              <>
                <input
                  type="date"
                  value={tuNgay}
                  onChange={(e) => setTuNgay(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                />

                <span className="text-gray-400 text-xs">→</span>

                <input
                  type="date"
                  value={denNgay}
                  onChange={(e) => setDenNgay(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </>
            )}

            {(loai === "tuan" || loai === "thang" || loai === "so_sanh") && (
              <select
                value={nam}
                onChange={(e) => setNam(+e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {Array.from({ length: 8 }, (_, i) => thisYear - 7 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            )}

            {loai === "so_sanh" && (
              <select
                value={thang}
                onChange={(e) => setThang(+e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    T{i + 1}
                  </option>
                ))}
              </select>
            )}

            {loai === "nam" && (
              <>
                <select
                  value={tuNam}
                  onChange={(e) => setTuNam(+e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(
                    (y) => (
                      <option key={y} value={y}>
                        Từ {y}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={denNam}
                  onChange={(e) => setDenNam(+e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(
                    (y) => (
                      <option key={y} value={y}>
                        Đến {y}
                      </option>
                    )
                  )}
                </select>
              </>
            )}

            <button
              onClick={fetchData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 text-sm rounded font-semibold"
            >
              Tải báo cáo
            </button>

          </div>

        </div>

      </div>

      {/* KPI */}

      <div className="px-10 mt-6 grid md:grid-cols-4 gap-4">

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-gray-500">Tổng SL Nhập</div>
          <div className="text-xl font-bold text-green-600">
            {fmtSL(kpi.tongNhap)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-gray-500">Tổng SL Xuất</div>
          <div className="text-xl font-bold text-red-500">
            {fmtSL(kpi.tongXuat)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-gray-500">Giá trị Nhập</div>
          <div className="text-lg font-bold text-purple-600">
            {fmtVND(kpi.tongGtrNhap)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-gray-500">Giá trị Xuất</div>
          <div className="text-lg font-bold text-purple-600">
            {fmtVND(kpi.tongGtrXuat)}
          </div>
        </div>

      </div>

      {/* CHART */}

      <div className="px-10 mt-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

          <ResponsiveContainer width="100%" height={320}>

            <ComposedChart data={data}>

              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

              <XAxis dataKey="nhanThoiGian" stroke="#666" />

              <YAxis stroke="#666" />

              <Tooltip />

              <Legend />

              <ReferenceLine y={0} stroke="#aaa" />

              <Bar dataKey="tongNhap" fill="#22c55e" />

              <Bar dataKey="tongXuat" fill="#ef4444" />

              <Line
                type="monotone"
                dataKey="chenhLech"
                stroke="#9333ea"
                strokeWidth={2}
              />

            </ComposedChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}