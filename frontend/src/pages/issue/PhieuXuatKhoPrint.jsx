import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";

const PRINT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');

.print-root {
  font-family: 'DM Sans', sans-serif;
  color: #1a1612;
  background: white;
  min-height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #faf8f3;
  border-bottom: 1px solid #e5d9c0;
  margin-bottom: 24px;
}

.top-left {
  font-size: 16px;
  font-weight: 600;
  color: #1a1612;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back {
  background: white;
  border: 1px solid #b8860b;
  color: #b8860b;
}

.btn-back:hover {
  background: #faf8f3;
}

.btn-print {
  background: linear-gradient(to right, #b8860b, #d4a017);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(184,134,11,0.3);
}

.btn-print:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184,134,11,0.4);
}

.print-container {
  max-width: 210mm;
  margin: 0 auto;
  padding: 0 18mm 25mm;
  box-sizing: border-box;
}

.title-main {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
  color: #1a1612;
}

.subtitle {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  text-align: center;
  color: #7a6e5f;
  margin: 0 0 20px;
}

.header-line {
  border-bottom: 2px solid #b8860b;
  margin: 0 0 28px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
}

.info-label {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #b8860b;
}

.info-value {
  font-weight: 600;
}

.table-container {
  margin: 24px 0;
}

.table-header {
  background: #faf8f3;
  border-bottom: 2px solid #b8860b;
}

.table-header th {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #b8860b;
  padding: 10px 12px;
  text-align: center;
}

.table-row td {
  padding: 10px 12px;
  border-bottom: 1px solid #e5d9c0;
  font-size: 13px;
  vertical-align: top;
}

.lot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4px 0;
  padding: 4px 8px;
  background: rgba(184,134,11,0.04);
  border-radius: 4px;
  text-align: center;
}

.lot-code {
  font-family: 'DM Mono', monospace;
  color: #b8860b;
  font-weight: 700;
  margin-bottom: 2px;
}

.lot-date {
  font-size: 12px;
  color: #7a6e5f;
}

.lot-qty {
  font-weight: 600;
  margin-top: 2px;
}

.total-row {
  background: #faf8f3;
  font-weight: 700;
  font-size: 15px;
}

.total-row td:last-child {
  color: #b8860b;
  font-size: 18px;
  text-align: right;
}

.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  font-size: 14px;
}

.signature-block {
  width: 45%;
  text-align: center;
}

.signature-title {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #b8860b;
  margin-bottom: 50px;
  text-transform: uppercase;
}

.signature-name {
  border-top: 1px solid #b8860b;
  padding-top: 8px;
  margin-top: 40px;
}

.signature-note {
  font-size: 11px;
  color: #7a6e5f;
  margin-top: 4px;
}

.page-number {
  text-align: center;
  font-size: 11px;
  color: #a89f92;
  margin-top: 40px;
}

/* Print rules */
@media print {
  @page {
    size: A4;
    margin: 12mm 10mm 15mm 10mm;
  }
  body {
    margin: 0;
    background: white;
  }
  .top-bar {
    display: none !important;
  }
}
`;

export default function PhieuXuatKhoPrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [pickedLotsMap, setPickedLotsMap] = useState({});
  const [lotMasterMap, setLotMasterMap] = useState({});

  useEffect(() => {
    fetchFullData();
  }, [id]);

  async function fetchFullData() {
    setLoading(true);
    try {
      const res = await phieuXuatKhoService.getDetail(id);
      const detailData = res?.data || res;
      setData(detailData);

      if (detailData?.chiTiet) {
        const pickPromises = detailData.chiTiet.map((item) =>
          phieuXuatKhoService.getPickedLots(id, item.id)
        );

        const availPromises = detailData.chiTiet.map((item) =>
          phieuXuatKhoService.getAvailableLots(id, item.bienTheSanPhamId)
        );

        const pickResults = await Promise.all(pickPromises);
        const availResults = await Promise.all(availPromises);

        const masterMap = {};
        availResults
          .flat()
          .filter(Boolean)
          .forEach((lot) => {
            if (lot.loHangId) {
              masterMap[lot.loHangId] = lot;
            }
          });
        setLotMasterMap(masterMap);

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
    return (
      <div className="min-h-screen flex items-center justify-center text-[#b8860b] text-lg font-mono tracking-wider bg-gradient-to-br from-[#faf8f3] to-[#ede9de]">
        Đang chuẩn bị bản in...
      </div>
    );
  }

  const { phieu, chiTiet } = data;
  const isChuyenKho = phieu.loaiXuat === "chuyen_kho";
  const tongSoLuong = chiTiet.reduce(
    (acc, item) => acc + (item.soLuongDaPick || 0),
    0
  );

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div className="print-root">
        {/* Top bar */}
        <div className="top-bar">
          <div className="top-left">In phiếu xuất kho</div>
          <div className="top-right">
            <button onClick={() => navigate(-1)} className="btn btn-back">
              ← Quay lại
            </button>
            <button onClick={() => window.print()} className="btn btn-print">
              In phiếu
            </button>
          </div>
        </div>

        {/* Print Container */}
        <div className="print-container">
          <h1 className="title-main">PHIẾU XUẤT KHO</h1>
          <div className="subtitle">
            Mã phiếu: {phieu.soPhieuXuat || "—"} • Ngày xuất:{" "}
            {phieu.ngayXuat
              ? new Date(phieu.ngayXuat).toLocaleDateString("vi-VN")
              : "—"}
          </div>

          <div className="header-line" />

          {/* Info Rows */}
          <div className="info-row">
            <div>
              <div className="info-label">KHO XUẤT HÀNG</div>
              <div className="info-value">{phieu.kho?.tenKho || "—"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="info-label">
                {isChuyenKho ? "KHO NHẬN" : "ĐƠN BÁN HÀNG"}
              </div>
              <div className="info-value">
                {isChuyenKho
                  ? phieu.khoChuyenDen?.tenKho || "—"
                  : phieu.donBanHang?.soDonHang
                  ? `#${phieu.donBanHang.soDonHang}`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="info-row">
            <div>
              <div className="info-label">LOẠI NGHIỆP VỤ</div>
              <div className="info-value">
                {isChuyenKho ? "Chuyển kho nội bộ" : "Xuất bán hàng"}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead className="table-header">
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th style={{ width: "260px", textAlign: "left" }}>SẢN PHẨM</th>
                  <th style={{ width: "200px" }}>LÔ HÀNG</th>
                  <th style={{ width: "100px" }}>SL TỪ LÔ</th>
                  <th style={{ width: "80px", textAlign: "right" }}>TỔNG SL</th>
                </tr>
              </thead>
              <tbody>
                {chiTiet.map((item, idx) => {
                  const lots = pickedLotsMap[item.id] || [];

                  return (
                    <tr key={item.id} className="table-row">
                      <td style={{ textAlign: "center", color: "#7a6e5f" }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.sku || "—"}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#7a6e5f",
                            marginTop: "2px",
                          }}
                        >
                          {item.tenBienThe || "—"}
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {lots.length > 0 ? (
                          lots.map((lo, i) => {
                            const lotInfo = lotMasterMap[lo.loHangId];
                            return (
                              <div key={i} className="lot-item">
                                <div className="lot-code">
                                  {lotInfo?.maLo || lo.loHangId || "—"}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div
                            className="lot-item"
                            style={{ color: "#c2410c", fontStyle: "italic" }}
                          >
                            Chưa pick lô
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {lots.length > 0 ? (
                          lots.map((lo, i) => (
                            <div key={i} className="lot-item">
                              <div className="lot-qty">{lo.soLuongDaPick}</div>
                            </div>
                          ))
                        ) : (
                          <div className="lot-item">—</div>
                        )}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        {item.soLuongDaPick || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td
                    colSpan={4}
                    style={{ textAlign: "right", padding: "12px" }}
                  >
                    TỔNG CỘNG
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "12px",
                      fontSize: "18px",
                    }}
                  >
                    {tongSoLuong}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="signatures">
            <div className="signature-block">
              <div className="signature-title">NGƯỜI XUẤT</div>
              <div className="signature-name">
                {phieu.nguoiXuat?.hoTen || ".............................."}
              </div>
              <div className="signature-note">(Ký và ghi rõ họ tên)</div>
            </div>

            <div className="signature-block">
              <div className="signature-title">NGƯỜI NHẬN HÀNG</div>
              <div className="signature-name">..............................</div>
              <div className="signature-note">(Ký và ghi rõ họ tên)</div>
            </div>
          </div>

          <div className="page-number">1/1</div>
        </div>
      </div>
    </>
  );
}