package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuNhapKhoDto {
    Integer id;
    String soPhieuNhap;
    Integer donMuaHangId;
    String soDonMua;
    Integer nhaCungCapId;
    String tenNhaCungCap;
    Integer khoId;
    String tenKho;
    Instant ngayNhap;
    Instant ngayTao;
    Integer trangThai;
    String ghiChu;
}
