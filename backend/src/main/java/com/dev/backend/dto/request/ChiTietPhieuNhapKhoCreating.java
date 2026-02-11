package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChiTietPhieuNhapKhoCreating {
    Integer bienTheSanPhamId;
    BigDecimal soLuongDuKienNhap; // SL cần nhập của đợt này
}
