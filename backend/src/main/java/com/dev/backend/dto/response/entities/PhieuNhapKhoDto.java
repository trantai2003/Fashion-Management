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
    String soDonMua;
    String tenNhaCungCap;
    String tenKho;
    Instant ngayNhap;
    Integer trangThai;
}
