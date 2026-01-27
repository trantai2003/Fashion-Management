package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Set;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhanQuyenNguoiDungKhoCreating {
    Integer nguoiDungId;
    Integer khoId;
    Integer laQuanLyKho;
    Instant ngayBatDau;
    Instant ngayKetThuc;
    String ghiChu;
    Set<ChiTietQuyenKhoCreating> chiTietQuyenKhos;
}

