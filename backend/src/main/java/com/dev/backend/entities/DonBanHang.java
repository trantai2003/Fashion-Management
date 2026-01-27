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
@Table(name = "don_ban_hang")
public class DonBanHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "so_don_hang", nullable = false, length = 50)
    private String soDonHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "khach_hang_id", nullable = false)
    private KhachHang khachHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_xuat_id", nullable = false)
    private Kho khoXuat;

    @NotNull
    @Column(name = "ngay_dat_hang", nullable = false)
    private Instant ngayDatHang;

    @Column(name = "ngay_giao_hang")
    private Instant ngayGiaoHang;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    @Generated(event = EventType.INSERT)
    private Integer trangThai;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "tien_hang", precision = 15, scale = 2)
    private BigDecimal tienHang;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "phi_van_chuyen", precision = 15, scale = 2)
    private BigDecimal phiVanChuyen;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "tong_cong", precision = 15, scale = 2)
    private BigDecimal tongCong;

    @ColumnDefault("'chua_thanh_toan'")
    @Generated(event = EventType.INSERT)
    
    @Column(name = "trang_thai_thanh_toan")
    private String trangThaiThanhToan;

    
    @Column(name = "dia_chi_giao_hang")
    private String diaChiGiaoHang;

    
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