package com.dev.backend.dto.response.entities;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaCungCapDto {
    private Integer id;
    private String maNhaCungCap;
    private String tenNhaCungCap;
    private String nguoiLienHe;
    private String soDienThoai;
    private String email;
    private String diaChi;
    private Integer trangThai;      // 0 = Ngừng, 1 = Hoạt động (theo DB)
    private Instant ngayTao;
    private Instant ngayCapNhat;
}