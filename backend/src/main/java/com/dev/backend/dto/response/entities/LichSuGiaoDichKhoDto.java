package com.dev.backend.dto.response.entities;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuGiaoDichKhoDto {
    private Integer id;
    private Instant ngayGiaoDich;
    private String loaiGiaoDich;
    private String loaiThamChieu;
    private Integer idThamChieu;
    private String tenSanPham;
    private String maSku;
    private String maLo;
    private Integer khoId;
    private String tenKho;
    private Integer khoChuyenDenId;
    private String tenKhoChuyenDen;
    private BigDecimal soLuong;
    private BigDecimal soLuongTruoc;
    private BigDecimal soLuongSau;
    private String nguoiDungTen;
    private String ghiChu;
}