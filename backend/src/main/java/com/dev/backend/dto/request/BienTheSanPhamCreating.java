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
public class BienTheSanPhamCreating {
    Integer mauSacId;
    Integer sizeId;
    Integer chatLieuId;
    String maSku;
    String maVachSku;
    BigDecimal giaVon;
    BigDecimal giaBan;
    Integer trangThai;

    public static BienTheSanPham toEntity(BienTheSanPhamCreating creating) {
        return BienTheSanPham.builder()
                .maVachSku(creating.getMaVachSku())
                .maSku(creating.getMaSku())
                .giaVon(creating.getGiaVon())
                .giaBan(creating.getGiaBan())
                .trangThai(creating.getTrangThai())
                .build();
    }
}
