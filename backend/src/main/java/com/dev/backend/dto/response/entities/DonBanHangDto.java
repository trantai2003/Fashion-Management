package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.DonBanHang}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class DonBanHangDto implements Serializable {
    Integer id;
    String soDonHang;
    KhachHangDto khachHang;
    KhoDto khoXuat;
    Instant ngayDatHang;
    Instant ngayGiaoHang;
    Integer trangThai;
    BigDecimal tienHang;
    BigDecimal phiVanChuyen;
    BigDecimal tongCong;
    String trangThaiThanhToan;
    String diaChiGiaoHang;
    String ghiChu;
    NguoiDungDto nguoiTao;
    NguoiDungDto nguoiDuyet;
    Instant ngayTao;
    Instant ngayCapNhat;
}