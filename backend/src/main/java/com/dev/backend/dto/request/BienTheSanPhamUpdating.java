package com.dev.backend.dto.request;

import com.dev.backend.entities.BienTheSanPham;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class BienTheSanPhamUpdating {
    Integer id;
    BigDecimal giaVon;
    BigDecimal giaBan;
    Integer trangThai;
    boolean isImageUpdated;

    public static BienTheSanPham toEntity(BienTheSanPhamUpdating updating) {
        return BienTheSanPham.builder()
                .giaVon(updating.getGiaVon())
                .giaBan(updating.getGiaBan())
                .trangThai(updating.getTrangThai())
                .build();
    }
}
