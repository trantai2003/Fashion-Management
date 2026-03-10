// src/main/java/com/dev/backend/dto/response/entities/DotKiemKeDto.java
package com.dev.backend.dto.response.entities;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DotKiemKeDto {
    private Integer id;
    private String maDotKiemKe;
    private String tenDotKiemKe;
    private KhoDto kho;
    private String loaiKiemKe;
    private Byte trangThai;
    private String ghiChu;
    private NguoiDungDto nguoiChuTri;
    private Instant ngayBatDau;
    private Instant ngayHoanThanh;
    private Instant ngayTao;
}