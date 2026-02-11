package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "don_ban_hang")
public class DonBanHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "so_don_hang", nullable = false, length = 50)
    String soDonHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "khach_hang_id", nullable = false)
    KhachHang khachHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_xuat_id", nullable = false)
    Kho khoXuat;

    @NotNull
    @Column(name = "ngay_dat_hang", nullable = false)
    Instant ngayDatHang;

    @Column(name = "ngay_giao_hang")
    Instant ngayGiaoHang;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    @Generated(event = EventType.INSERT)
    Integer trangThai;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "tien_hang", precision = 15, scale = 2)
    BigDecimal tienHang;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "phi_van_chuyen", precision = 15, scale = 2)
    BigDecimal phiVanChuyen;

    @ColumnDefault("0.00")
    @Generated(event = EventType.INSERT)
    @Column(name = "tong_cong", precision = 15, scale = 2)
    BigDecimal tongCong;

    @ColumnDefault("'chua_thanh_toan'")
    @Generated(event = EventType.INSERT)
    @Lob
    @Column(name = "trang_thai_thanh_toan")
    String trangThaiThanhToan;

    @Lob
    @Column(name = "dia_chi_giao_hang")
    String diaChiGiaoHang;

    @Lob
    @Column(name = "ghi_chu")
    String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    NguoiDung nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    NguoiDung nguoiDuyet;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_cap_nhat")
    Instant ngayCapNhat;


}