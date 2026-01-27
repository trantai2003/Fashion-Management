package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class PhanQuyenNguoiDungKhoDto implements Serializable {
    Integer id;
    NguoiDungDto nguoiDung;
    KhoDto kho;
    Integer laQuanLyKho;
    Integer trangThai;
    Instant ngayBatDau;
    Instant ngayKetThuc;
    NguoiDungDto nguoiCapQuyen;
    String ghiChu;
    Instant ngayTao;
    Instant ngayCapNhat;
    Set<ChiTietQuyenKhoDto> chiTietQuyenKhos;

    public List<String> getStringListPermission() {
        return chiTietQuyenKhos.stream().map(
                ChiTietQuyenKhoDto::getMaQuyenHan
        ).toList();
    }
}
