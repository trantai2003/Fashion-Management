package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "lich_su_giao_dich_kho")
public class LichSuGiaoDichKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_giao_dich")
    private Instant ngayGiaoDich;

    @NotNull
    @Column(name = "loai_giao_dich", nullable = false)
    private String loaiGiaoDich;

    @Size(max = 50)
    @Column(name = "loai_tham_chieu", length = 50)
    private String loaiThamChieu;

    @Column(name = "id_tham_chieu")
    private Integer idThamChieu;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    private BienTheSanPham bienTheSanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lo_hang_id", nullable = false)
    private LoHang loHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_chuyen_den_id")
    private Kho khoChuyenDen;

    @NotNull
    @Column(name = "so_luong", nullable = false, precision = 15, scale = 3)
    private BigDecimal soLuong;

    @Column(name = "so_luong_truoc", precision = 15, scale = 3)
    private BigDecimal soLuongTruoc;

    @Column(name = "so_luong_sau", precision = 15, scale = 3)
    private BigDecimal soLuongSau;

    @Column(name = "gia_von", precision = 15, scale = 2)
    private BigDecimal giaVon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;


}