package com.dev.backend.dto.response.customize;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TonKhoChiTietDTO {
    // Thông tin sản phẩm
    Integer bienTheId;
    String maSku;
    String tenSanPham;
    String maSanPham;
    String tenDanhMuc;

    // Thông tin biến thể
    String tenMau;
    String maMauHex;
    String tenSize;
    String tenChatLieu;

    // Thông tin kho
    Integer khoId;
    String tenKho;

    // Thông tin tồn kho tổng hợp
    BigDecimal tongSoLuongTon;
    BigDecimal tongSoLuongDaDat;
    BigDecimal tongSoLuongKhaDung;

    // Giá
    BigDecimal giaVon;
    BigDecimal giaBan;
    BigDecimal giaTriTonKho; // = tongSoLuongTon * giaVon

    // Danh sách lô hàng
    List<LoHangTonKhoDTO> danhSachLoHang;

    // Thời gian
    Instant ngayNhapGanNhat;
    Instant ngayXuatGanNhat;

    // Constructor cho JPQL query
    public TonKhoChiTietDTO(
            Integer bienTheId,
            String maSku,
            String tenSanPham,
            String maSanPham,
            String tenDanhMuc,
            String tenMau,
            String maMauHex,
            String tenSize,
            String tenChatLieu,
            Integer khoId,
            String tenKho,
            BigDecimal tongSoLuongTon,
            BigDecimal tongSoLuongDaDat,
            BigDecimal giaVon,
            BigDecimal giaBan,
            Instant ngayNhapGanNhat,
            Instant ngayXuatGanNhat
    ) {
        this.bienTheId = bienTheId;
        this.maSku = maSku;
        this.tenSanPham = tenSanPham;
        this.maSanPham = maSanPham;
        this.tenDanhMuc = tenDanhMuc;
        this.tenMau = tenMau;
        this.maMauHex = maMauHex;
        this.tenSize = tenSize;
        this.tenChatLieu = tenChatLieu;
        this.khoId = khoId;
        this.tenKho = tenKho;
        this.tongSoLuongTon = tongSoLuongTon != null ? tongSoLuongTon : BigDecimal.ZERO;
        this.tongSoLuongDaDat = tongSoLuongDaDat != null ? tongSoLuongDaDat : BigDecimal.ZERO;
        this.tongSoLuongKhaDung = this.tongSoLuongTon.subtract(this.tongSoLuongDaDat);
        this.giaVon = giaVon;
        this.giaBan = giaBan;
        this.giaTriTonKho = this.tongSoLuongTon.multiply(giaVon != null ? giaVon : BigDecimal.ZERO);
        this.ngayNhapGanNhat = ngayNhapGanNhat;
        this.ngayXuatGanNhat = ngayXuatGanNhat;
        this.danhSachLoHang = new ArrayList<>();
    }
}
