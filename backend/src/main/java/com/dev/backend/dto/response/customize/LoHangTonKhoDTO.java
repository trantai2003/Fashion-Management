package com.dev.backend.dto.response.customize;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoHangTonKhoDTO {
    private Integer loHangId;
    private String maLo;
    private Instant ngaySanXuat;
    private String tenNhaCungCap;
    private BigDecimal giaVonLo;
    private BigDecimal soLuongTon;
    private BigDecimal soLuongDaDat;
    private BigDecimal soLuongKhaDung;
    private Instant ngayNhapGanNhat;

    // Constructor cho JPQL
    public LoHangTonKhoDTO(
            Integer loHangId,
            String maLo,
            Instant ngaySanXuat,
            String tenNhaCungCap,
            BigDecimal giaVonLo,
            BigDecimal soLuongTon,
            BigDecimal soLuongDaDat,
            Instant ngayNhapGanNhat
    ) {
        this.loHangId = loHangId;
        this.maLo = maLo;
        this.ngaySanXuat = ngaySanXuat;
        this.tenNhaCungCap = tenNhaCungCap;
        this.giaVonLo = giaVonLo;
        this.soLuongTon = soLuongTon != null ? soLuongTon : BigDecimal.ZERO;
        this.soLuongDaDat = soLuongDaDat != null ? soLuongDaDat : BigDecimal.ZERO;
        this.soLuongKhaDung = this.soLuongTon.subtract(this.soLuongDaDat);
        this.ngayNhapGanNhat = ngayNhapGanNhat;
    }
}
