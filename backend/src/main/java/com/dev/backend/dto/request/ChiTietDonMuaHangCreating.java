package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ChiTietDonMuaHangCreating {
    Integer bienTheSanPhamId;
    BigDecimal soLuongDat;
    BigDecimal soLuongDaNhan;
    BigDecimal donGia;
    BigDecimal thanhTien;
    String ghiChu;
}
