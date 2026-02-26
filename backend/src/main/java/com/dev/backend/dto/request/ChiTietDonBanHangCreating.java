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
public class ChiTietDonBanHangCreating {
    private Integer bienTheSanPhamId;
    private BigDecimal soLuongDat;
    private BigDecimal donGia;
    private String ghiChu;
}

