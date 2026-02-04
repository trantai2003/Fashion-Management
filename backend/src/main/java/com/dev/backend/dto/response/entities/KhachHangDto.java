// src/main/java/com/dev/backend/dto/response/entities/KhachHangDto.java
package com.dev.backend.dto.response.entities;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHangDto {
    private Integer id;
    private String maKhachHang;
    private String tenKhachHang;
    private String nguoiLienHe;
    private String soDienThoai;
    private String email;
    private String diaChi;
    private String loaiKhachHang;  // 'le' hoặc 'buon'
    private Integer trangThai;     // 0 hoặc khác
    private Instant ngayTao;
    private Instant ngayCapNhat;
}