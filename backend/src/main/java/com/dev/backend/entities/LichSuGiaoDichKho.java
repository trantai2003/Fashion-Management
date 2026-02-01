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
@Table(name = "lich_su_giao_dich_kho")
public class LichSuGiaoDichKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_giao_dich")
    Instant ngayGiaoDich;

    @NotNull
    @Lob
    @Column(name = "loai_giao_dich", nullable = false)
    String loaiGiaoDich;

    @Size(max = 50)
    @Column(name = "loai_tham_chieu", length = 50)
    String loaiThamChieu;

    @Column(name = "id_tham_chieu")
    Integer idThamChieu;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    BienTheSanPham bienTheSanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lo_hang_id", nullable = false)
    LoHang loHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    Kho kho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_chuyen_den_id")
    Kho khoChuyenDen;

    @NotNull
    @Column(name = "so_luong", nullable = false, precision = 15, scale = 3)
    BigDecimal soLuong;

    @Column(name = "so_luong_truoc", precision = 15, scale = 3)
    BigDecimal soLuongTruoc;

    @Column(name = "so_luong_sau", precision = 15, scale = 3)
    BigDecimal soLuongSau;

    @Column(name = "gia_von", precision = 15, scale = 2)
    BigDecimal giaVon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    NguoiDung nguoiDung;

    @Lob
    @Column(name = "ghi_chu")
    String ghiChu;


}