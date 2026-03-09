package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoanhThuChartDTO {
    String nhanThoiGian;        // Nhãn trục X: "01/01", "Tuần 1", "T1/2024", "2024"

    BigDecimal tienHang;        // Tổng tiền hàng (trước ship)
    BigDecimal phiVanChuyen;    // Tổng phí vận chuyển
    BigDecimal doanhThu;        // Tổng cộng = tienHang + phiVanChuyen  → CỘT
    BigDecimal giaVon;          // Tổng giá vốn xuất kho
    BigDecimal loiNhuan;        // doanhThu - giaVon                    → ĐƯỜNG

    public DoanhThuChartDTO(String nhanThoiGian, BigDecimal tienHang, BigDecimal phiVanChuyen,
                            BigDecimal doanhThu, BigDecimal giaVon, BigDecimal loiNhuan,
                            Long soLuongDon, Integer sortKey) {
        this.nhanThoiGian = nhanThoiGian;
        this.tienHang = tienHang;
        this.phiVanChuyen = phiVanChuyen;
        this.doanhThu = doanhThu;
        this.giaVon = giaVon;
        this.loiNhuan = loiNhuan;
        this.soLuongDon = soLuongDon;
        this.sortKey = sortKey;
    }

    Long       soLuongDon;      // Số đơn hàng hoàn thành               → ĐƯỜNG PHỤ
    BigDecimal tyLeLaiGop;      // loiNhuan / doanhThu * 100

    // Thêm trường sắp xếp nội bộ (không render ra chart)
    Integer    sortKey;
}
