package com.dev.backend.dto.response.entities;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuXuatKhoDto {
    Integer id;
    String soPhieuXuat;
    String loaiXuat;
    String soDonHang;
    String tenKho;
    String tenKhoChuyenDen;
    Instant ngayXuat;
    Integer trangThai;
    String ghiChu;
}

