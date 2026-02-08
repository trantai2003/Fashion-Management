package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuNhapKhoItemDto {
    Integer bienTheSanPhamId;
    String sku;
    String tenBienThe;
    BigDecimal soLuongCanNhap;   // kế hoạch nhập đợt này
    BigDecimal soLuongDaKhaiBao;    // đã khai báo lô
    Boolean daDuLo;
}
