package com.dev.backend.dto.response.customize;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TonKhoTongHopDTO {
     String tenSanPham;
     String maSanPham;
     Long soLuongBienThe;
     BigDecimal tongSoLuongTon;
     BigDecimal tongGiaTriTonKho;
     Long soLuongLoHang;

}
