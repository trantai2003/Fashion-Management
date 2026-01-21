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

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_don_ban_hang")
public class ChiTietDonBanHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "don_ban_hang_id", nullable = false)
    private DonBanHang donBanHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    private BienTheSanPham bienTheSanPham;

    @NotNull
    @Column(name = "so_luong_dat", nullable = false, precision = 15, scale = 3)
    private BigDecimal soLuongDat;

    @ColumnDefault("0.000")
    @Column(name = "so_luong_da_giao", precision = 15, scale = 3)
    @Generated(event = EventType.INSERT)
    private BigDecimal soLuongDaGiao;

    @NotNull
    @Column(name = "don_gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal donGia;

    @ColumnDefault("(`so_luong_dat` * `don_gia`)")
    @Column(name = "thanh_tien", precision = 15, scale = 2)
    @Generated(event = EventType.INSERT)
    private BigDecimal thanhTien;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;


}