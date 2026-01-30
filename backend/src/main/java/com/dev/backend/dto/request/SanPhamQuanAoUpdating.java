package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SanPhamQuanAoUpdating {

    Integer id;
    String maSanPham;
    String tenSanPham;
    Integer danhMucId;
    String moTa;
    String maVach;
    BigDecimal giaVonMacDinh;
    BigDecimal giaBanMacDinh;
    Integer mucTonToiThieu;
    Integer trangThai;
    boolean isImageUpdated;
    List<BienTheSanPhamUpdating> bienTheSanPhams;
}
