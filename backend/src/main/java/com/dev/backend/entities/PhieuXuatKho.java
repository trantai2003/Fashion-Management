package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "phieu_xuat_kho")
public class PhieuXuatKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "so_phieu_xuat", nullable = false, length = 50)
    private String soPhieuXuat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_ban_hang_id")
    private DonBanHang donBanHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @NotNull
    @Column(name = "ngay_xuat", nullable = false)
    private LocalDate ngayXuat;

    @ColumnDefault("'ban_hang'")
    @Lob
    @Column(name = "loai_xuat")
    private String loaiXuat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_chuyen_den_id")
    private Kho khoChuyenDen;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_xuat_id")
    private NguoiDung nguoiXuat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;


}