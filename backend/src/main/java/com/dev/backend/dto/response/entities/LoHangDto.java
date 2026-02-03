package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.LoHang}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class LoHangDto implements Serializable {
    Integer id;
    BienTheSanPhamDto bienTheSanPham;
    String maLo;
    Instant ngaySanXuat;
    NhaCungCapDto nhaCungCap;
    BigDecimal giaVon;
    String ghiChu;
    Instant ngayTao;
}