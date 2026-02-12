package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChiTietPhieuXuatKhoCreating {
    Integer bienTheSanPhamId;
    BigDecimal soLuongXuat;
}
