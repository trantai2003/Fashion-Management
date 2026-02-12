package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.KhachHang}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class KhachHangDto implements Serializable {
    private Integer id;
    private String maKhachHang;
    private String tenKhachHang;
    private String nguoiLienHe;
    private String soDienThoai;
    private String email;
    private String diaChi;
    private String loaiKhachHang;
    private Integer trangThai;
    private Instant ngayTao;
    private Instant ngayCapNhat;
}