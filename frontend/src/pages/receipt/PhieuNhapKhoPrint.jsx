import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";

export default function PhieuNhapKhoPrint() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [allLots, setAllLots] = useState({});

  useEffect(() => {
    fetchFullData();
  }, [id]);

  async function fetchFullData() {

    setLoading(true);

    try {

      const resDetail = await phieuNhapKhoService.getDetail(id);

      setData(resDetail);

      const lotPromises = resDetail.items.map(item =>
        phieuNhapKhoService.getLotInput(id, item.bienTheSanPhamId)
      );

      const lotResults = await Promise.all(lotPromises);

      const lotMap = {};

      resDetail.items.forEach((item, index) => {
        lotMap[item.bienTheSanPhamId] = lotResults[index].data || [];
      });

      setAllLots(lotMap);

    } catch (e) {

      console.error(e);
      toast.error("Không thể tải dữ liệu in");

    } finally {

      setLoading(false);

    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg font-semibold">
        Đang chuẩn bị bản in...
      </div>
    );
  }

  const isInternal = data.soPhieuNhap?.startsWith("PN-TRF-");

  const tongSoLuong = data.items.reduce(
    (acc, item) => acc + (item.soLuongDaKhaiBao || 0),
    0
  );

  return (

    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">

      {/* NAVBAR */}

      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-black font-medium"
        >
          ← Quay lại chi tiết phiếu
        </button>

        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          In phiếu
        </button>

      </div>


      {/* PRINT AREA */}

      <div id="invoice-area" className="max-w-5xl mx-auto bg-white p-12 shadow border print:border-none print:shadow-none print:p-0">


        {/* HEADER */}

        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">

          <div>

            <h1 className="text-3xl font-black uppercase tracking-tight">
              Phiếu Nhập Kho
            </h1>

            <p className="mt-2 text-sm">
              Mã phiếu:
              <span className="font-mono text-lg ml-2">
                {data.soPhieuNhap}
              </span>
            </p>

            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Ngày nhập: {new Date().toLocaleDateString("vi-VN")}
            </p>

          </div>

          <div className="text-right">

            <h2 className="text-xl font-bold text-purple-700">
              FASHIONFLOW
            </h2>

            <p className="text-sm text-gray-500">
              Hệ thống quản lý kho
            </p>

          </div>

        </div>


        {/* INFO */}

        <div className="grid grid-cols-2 gap-12 mb-10 text-sm">

          <div className="space-y-3">

            <div>
              <p className="text-xs text-gray-400 uppercase">Kho tiếp nhận</p>
              <p className="font-bold text-lg">{data.tenKho}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Loại nghiệp vụ</p>
              <p className="font-semibold">
                {isInternal
                  ? "Chuyển kho nội bộ"
                  : "Nhập hàng từ nhà cung cấp"}
              </p>
            </div>

          </div>


          <div className="space-y-3 text-right">

            <div>
              <p className="text-xs text-gray-400 uppercase">Đối tác</p>
              <p className="font-bold text-lg">
                {isInternal ? "Kho nội bộ" : data.tenNhaCungCap}
              </p>
            </div>

            {!isInternal && (
              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Đơn mua hàng
                </p>
                <p className="font-semibold">
                  #{data.soDonMua}
                </p>
              </div>
            )}

          </div>

        </div>


        {/* TABLE */}

        <div>

          <h3 className="text-sm font-bold uppercase mb-4">
            Chi tiết hàng hóa
          </h3>

          <table className="w-full text-sm">

            <thead>

              <tr className="bg-gray-900 text-white text-xs uppercase">

                <th className="p-3 text-left w-12">STT</th>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-left">Lô hàng</th>
                <th className="p-3 text-right w-24">SL</th>

              </tr>

            </thead>


            <tbody className="divide-y">

              {data.items.map((item, idx) => {

                const lots = allLots[item.bienTheSanPhamId] || [];

                return (

                  <tr key={item.bienTheSanPhamId}>

                    <td className="p-3 text-gray-500 font-bold">
                      {idx + 1}
                    </td>

                    <td className="p-3">

                      <div className="font-bold">{item.sku}</div>

                      <div className="text-xs text-gray-500">
                        {item.tenBienThe}
                      </div>

                    </td>


                    <td className="p-3">

                      {lots.length > 0 ? (

                        <div className="space-y-1">

                          {lots.map((lo, lIdx) => (

                            <div
                              key={lIdx}
                              className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded"
                            >

                              <span className="font-semibold text-purple-600">
                                {lo.maLo}
                              </span>

                              <span className="text-gray-500">
                                {lo.ngaySanXuat
                                  ? new Date(lo.ngaySanXuat)
                                      .toLocaleDateString("vi-VN")
                                  : "---"}
                              </span>

                              <span className="font-semibold">
                                {lo.soLuongNhap}
                              </span>

                            </div>

                          ))}

                        </div>

                      ) : (

                        <span className="text-red-500 text-xs italic">
                          Chưa khai báo lô
                        </span>

                      )}

                    </td>


                    <td className="p-3 text-right font-bold">
                      {item.soLuongDaKhaiBao || 0}
                    </td>

                  </tr>

                );

              })}

            </tbody>


            <tfoot>

              <tr className="bg-gray-50 font-bold">

                <td colSpan={3} className="p-4 text-right text-xs uppercase">
                  Tổng cộng
                </td>

                <td className="p-4 text-right text-purple-700 text-lg">
                  {tongSoLuong}
                </td>

              </tr>

            </tfoot>

          </table>

        </div>


        {/* SIGN */}

        <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm">

          <div>

            <p className="font-semibold uppercase mb-16">
              Người nhập
            </p>

            <p className="font-semibold">
              {data.tenNguoiNhap || "Nhân viên"}
            </p>

            <p className="text-xs text-gray-400">
              (Ký và ghi rõ họ tên)
            </p>

          </div>


          <div>

            <p className="font-semibold uppercase mb-16">
              Người giao hàng
            </p>

            <p className="text-xs text-gray-400">
              (Ký và ghi rõ họ tên)
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}