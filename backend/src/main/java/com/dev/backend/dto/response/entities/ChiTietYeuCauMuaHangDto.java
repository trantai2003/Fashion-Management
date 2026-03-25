package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.dev.backend.entities.ChiTietYeuCauMuaHang}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class ChiTietYeuCauMuaHangDto implements Serializable {
    Integer id;
    BienTheSanPhamDto bienTheSanPham;
    BigDecimal soLuongDat;
    String ghiChu;
}