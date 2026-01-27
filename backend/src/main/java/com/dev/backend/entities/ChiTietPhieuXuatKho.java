package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_phieu_xuat_kho")
public class ChiTietPhieuXuatKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "phieu_xuat_kho_id", nullable = false)
    private PhieuXuatKho phieuXuatKho;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    private BienTheSanPham bienTheSanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lo_hang_id", nullable = false)
    private LoHang loHang;

    @NotNull
    @Column(name = "so_luong_xuat", nullable = false, precision = 15, scale = 3)
    private BigDecimal soLuongXuat;

    @Column(name = "gia_von", precision = 15, scale = 2)
    private BigDecimal giaVon;

    
    @Column(name = "ghi_chu")
    private String ghiChu;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;


}