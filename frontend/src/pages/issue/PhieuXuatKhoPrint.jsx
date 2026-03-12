import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";

export default function PhieuXuatKhoPrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [pickedLotsMap, setPickedLotsMap] = useState({});
  // State mới để tra cứu tên lô từ ID
  const [lotMasterMap, setLotMasterMap] = useState({});

  useEffect(() => {
    fetchFullData();
  }, [id]);

  async function fetchFullData() {
    setLoading(true);
    try {
      // 1. Lấy chi tiết phiếu xuất
      const res = await phieuXuatKhoService.getDetail(id);
      const detailData = res?.data || res;
      setData(detailData);

      if (detailData?.chiTiet) {
        // 2. Gọi song song: Lấy Lô đã pick VÀ Lô khả dụng (để lấy tên maLo)
        const pickPromises = detailData.chiTiet.map(item =>
          phieuXuatKhoService.getPickedLots(id, item.id)
        );

        const availPromises = detailData.chiTiet.map(item =>
          phieuXuatKhoService.getAvailableLots(id, item.bienTheSanPhamId)
        );

        const pickResults = await Promise.all(pickPromises);
        const availResults = await Promise.all(availPromises);

        // 3. Xây dựng Danh bạ Lô hàng (Master Map) để tra cứu maLo từ ID
        const masterMap = {};
        availResults
          .flat()
          .filter(Boolean)
          .forEach(lot => {
            if (lot.loHangId) {
              masterMap[lot.loHangId] = lot;
            }
          });
        setLotMasterMap(masterMap);

        // 4. Map kết quả pick vào từng chi tiết sản phẩm
        const lotMap = {};
        detailData.chiTiet.forEach((item, index) => {
          const res = pickResults[index];
          lotMap[item.id] = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
        });
        setPickedLotsMap(lotMap);
      }
    } catch (e) {
      console.error("Lỗi fetch:", e);
      toast.error("Không thể tải dữ liệu in");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return <div className="p-10 text-center font-medium">Đang chuẩn bị bản in phiếu xuất...</div>;
  }

  const { phieu, chiTiet } = data;
  const isChuyenKho = phieu.loaiXuat === "chuyen_kho";
  const tongSoLuong = chiTiet.reduce((acc, item) => acc + (item.soLuongDaPick || 0), 0);

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
              Phiếu Xuất Kho
            </h1>

            <p className="mt-2 text-sm">
              Mã phiếu:
              <span className="font-mono text-lg ml-2">
                {phieu.soPhieuXuat}
              </span>
            </p>

            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Ngày xuất: {phieu.ngayXuat
                ? new Date(phieu.ngayXuat).toLocaleDateString("vi-VN")
                : "---"}
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
              <p className="text-xs text-gray-400 uppercase">
                Kho xuất hàng
              </p>
              <p className="font-bold text-lg">
                {phieu.kho?.tenKho}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">
                Loại nghiệp vụ
              </p>
              <p className="font-semibold">
                {isChuyenKho
                  ? "Chuyển kho nội bộ"
                  : "Xuất bán hàng"}
              </p>
            </div>

          </div>


          <div className="space-y-3 text-right">

            {isChuyenKho ? (

              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Kho nhận
                </p>
                <p className="font-bold text-lg">
                  {phieu.khoChuyenDen?.tenKho}
                </p>
              </div>

            ) : (

              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Đơn bán hàng
                </p>
                <p className="font-semibold">
                  #{phieu.donBanHang?.soDonHang}
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

              {chiTiet.map((item, idx) => {

                const lots = pickedLotsMap[item.id] || [];

                return (

                  <tr key={item.id}>

                    <td className="p-3 text-gray-500 font-bold">
                      {idx + 1}
                    </td>

                    <td className="p-3">

                      <div className="font-bold">
                        {item.sku}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.tenBienThe}
                      </div>

                    </td>


                    <td className="p-3">

                      {lots.length > 0 ? (

                        <div className="space-y-1">

                          {lots.map((lo, i) => {

                            const lotInfo = lotMasterMap[lo.loHangId];

                            return (

                              <div
                                key={i}
                                className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded"
                              >

                                <span className="font-semibold text-purple-600">
                                  {lotInfo?.maLo || lo.loHangId}
                                </span>

                                <span className="font-semibold">
                                  {lo.soLuongDaPick}
                                </span>

                              </div>

                            );

                          })}

                        </div>

                      ) : (

                        <span className="text-red-500 text-xs italic">
                          Chưa pick lô
                        </span>

                      )}

                    </td>


                    <td className="p-3 text-right font-bold">
                      {item.soLuongDaPick}
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
              Người xuất
            </p>

            <p className="font-semibold">
              {phieu.nguoiXuat?.hoTen || "Nhân viên"}
            </p>

            <p className="text-xs text-gray-400">
              (Ký và ghi rõ họ tên)
            </p>

          </div>


          <div>

            <p className="font-semibold uppercase mb-16">
              Người nhận hàng
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