package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "canh_bao")
public class CanhBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @NotNull
    @Lob
    @Column(name = "loai_canh_bao", nullable = false)
    String loaiCanhBao;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    BienTheSanPham bienTheSanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    Kho kho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lo_hang_id")
    LoHang loHang;

    @Column(name = "so_luong_hien_tai", precision = 15, scale = 3)
    BigDecimal soLuongHienTai;

    @Column(name = "nguong_canh_bao", precision = 15, scale = 3)
    BigDecimal nguongCanhBao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_canh_bao")
    @Generated(event = EventType.INSERT)
    Instant ngayCanhBao;

    @ColumnDefault("0")
    @Generated(event = EventType.INSERT)
    @Column(name = "trang_thai")
    Integer trangThai;

    @Column(name = "ngay_xu_ly")
    Instant ngayXuLy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_xu_ly_id")
    NguoiDung nguoiXuLy;


}