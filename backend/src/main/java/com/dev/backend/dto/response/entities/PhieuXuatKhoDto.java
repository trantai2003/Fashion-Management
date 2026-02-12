package com.dev.backend.dto.response.entities;

import com.dev.backend.entities.DonBanHang;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.PhieuXuatKho}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class PhieuXuatKhoDto implements Serializable {
    Integer id;
    String soPhieuXuat;
    DonBanHangDto donBanHang;
    KhoDto kho;
    Instant ngayXuat;
    String loaiXuat;
    KhoDto khoChuyenDen;
    Integer trangThai;
    String ghiChu;
    NguoiDungDto nguoiXuat;
    NguoiDungDto nguoiDuyet;
    Instant ngayTao;
    Instant ngayCapNhat;
}