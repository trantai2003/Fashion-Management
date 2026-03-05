package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class GiaoDichDto {
    String soDonMua;
    String maGiaoDich;
    String nganHang;
    String soNganHang;
    String tenNhaCungCap;
    String tenKho;
    BigDecimal tongTien;
}
