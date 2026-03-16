import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
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
      const res = await phieuNhapKhoService.getDetail(id);
      setData(res);

      const lotPromises = res.items.map((item) =>
        phieuNhapKhoService.getLotInput(id, item.bienTheSanPhamId)
      );

      const lotResults = await Promise.all(lotPromises);

      const lotMap = {};
      res.items.forEach((item, index) => {
        lotMap[item.bienTheSanPhamId] = lotResults[index]?.data || [];
      });
      setAllLots(lotMap);
    } catch (e) {
      console.error("Lỗi tải dữ liệu in:", e);
      toast.error("Không thể tải dữ liệu để in phiếu");
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

  const isInternal = data.soPhieuNhap?.startsWith("PN-TRF-") ||
                     (data.loaiNhap || "").toLowerCase().includes("chuyển kho");

  const totalQty = data.items.reduce(
    (acc, item) => acc + (Number(item.soLuongDaKhaiBao) || 0),
    0
  );

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div className="print-root">
        {/* Top bar với nút */}
        <div className="top-bar">
          <div className="top-left">In phiếu nhập kho</div>
          <div className="top-right">
            <button onClick={() => navigate(-1)} className="btn btn-back">
              ← Quay lại
            </button>
            <button onClick={() => window.print()} className="btn btn-print">
              In phiếu
            </button>
          </div>
        </div>

        <div className="print-container">
          <h1 className="title-main">PHIẾU NHẬP KHO</h1>
          <div className="subtitle">
            Mã phiếu: {data.soPhieuNhap || "—"} • Ngày nhập: {data.ngayNhap
              ? new Date(data.ngayNhap).toLocaleDateString("vi-VN")
              : "—"}
          </div>

          <div className="header-line" />

          <div className="info-row">
            <div>
              <div className="info-label">KHO TIẾP NHẬN</div>
              <div className="info-value">{data.tenKho || "—"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="info-label">ĐỐI TÁC / NGUỒN</div>
              <div className="info-value">
                {isInternal ? "Kho nội bộ" : (data.tenNhaCungCap || "—")}
              </div>
            </div>
          </div>

          <div className="info-row">
            <div>
              <div className="info-label">LOẠI NGHIỆP VỤ</div>
              <div className="info-value">
                {isInternal ? "Chuyển kho nội bộ" : "Nhập từ nhà cung cấp"}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead className="table-header">
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th style={{ width: "220px" }}>SẢN PHẨM</th>
                  <th style={{ width: "180px" }}>LÔ HÀNG</th>
                  <th style={{ width: "120px" }}>Ngày sản xuất</th>
                  <th style={{ width: "100px" }}>SL trong lô</th>
                  <th style={{ width: "80px", textAlign: "right" }}>SL</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => {
                  const lots = allLots[item.bienTheSanPhamId] || [];
                  return (
                    <tr key={item.bienTheSanPhamId || idx} className="table-row">
                      <td style={{ textAlign: "center", color: "#7a6e5f" }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.sku || item.maBienThe || "—"}</div>
                        <div style={{ fontSize: "12px", color: "#7a6e5f", marginTop: "2px" }}>
                          {item.tenBienThe || item.tenSanPham || "—"}
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {lots.length > 0 ? (
                          lots.map((lot, i) => (
                            <div key={i} className="lot-item">
                              <div className="lot-code">{lot.maLo || "—"}</div>
                            </div>
                          ))
                        ) : (
                          <div className="lot-item" style={{ color: "#c2410c", fontStyle: "italic" }}>
                            Chưa khai báo
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {lots.length > 0 ? (
                          lots.map((lot, i) => (
                            <div key={i} className="lot-item">
                              <div className="lot-date">
                                {lot.ngaySanXuat
                                  ? new Date(lot.ngaySanXuat).toLocaleDateString("vi-VN")
                                  : "—"}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="lot-item">—</div>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {lots.length > 0 ? (
                          lots.map((lot, i) => (
                            <div key={i} className="lot-item">
                              <div className="lot-qty">{lot.soLuongNhap || 0}</div>
                            </div>
                          ))
                        ) : (
                          <div className="lot-item">—</div>
                        )}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        {item.soLuongDaKhaiBao || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={5} style={{ textAlign: "right", padding: "12px" }}>
                    TỔNG CỘNG
                  </td>
                  <td style={{ textAlign: "right", padding: "12px", fontSize: "18px" }}>
                    {totalQty}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="signatures">
            <div className="signature-block">
              <div className="signature-title">NGƯỜI NHẬP</div>
              <div className="signature-name">
                {data.tenNguoiNhap || "Trần Đức Tài"}
              </div>
              <div className="signature-note">(Ký và ghi rõ họ tên)</div>
            </div>

            <div className="signature-block">
              <div className="signature-title">NGƯỜI GIAO</div>
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