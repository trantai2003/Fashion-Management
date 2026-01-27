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
@Table(name = "don_mua_hang")
public class DonMuaHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "so_don_mua", nullable = false, length = 50)
    private String soDonMua;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    private NhaCungCap nhaCungCap;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_nhap_id", nullable = false)
    private Kho khoNhap;

    @NotNull
    @Column(name = "ngay_dat_hang", nullable = false)
    private Instant ngayDatHang;

    @Column(name = "ngay_giao_du_kien")
    private Instant ngayGiaoDuKien;

    @ColumnDefault("0")
    @Generated(event = EventType.INSERT)
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "tong_tien", precision = 15, scale = 2)
    private BigDecimal tongTien;

    
    @Column(name = "ghi_chu")
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    private NguoiDung nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;


}