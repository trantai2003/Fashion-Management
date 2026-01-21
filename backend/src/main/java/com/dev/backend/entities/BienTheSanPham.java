package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "bien_the_san_pham")
public class BienTheSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private SanPhamQuanAo sanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mau_sac_id", nullable = false)
    private MauSac mauSac;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "size_id", nullable = false)
    private com.dev.backend.entities.Size size;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_lieu_id", nullable = false)
    private ChatLieu chatLieu;

    @Size(max = 100)
    @NotNull
    @Column(name = "ma_sku", nullable = false, length = 100)
    private String maSku;

    @Size(max = 100)
    @Column(name = "ma_vach_sku", length = 100)
    private String maVachSku;

    @ColumnDefault("0.00")
    @Column(name = "gia_von", precision = 15, scale = 2)
    private BigDecimal giaVon;

    @ColumnDefault("0.00")
    @Column(name = "gia_ban", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    @Generated(event = EventType.INSERT)
    private Instant ngayCapNhat;

    @OneToOne(mappedBy = "bienThe")
    private AnhBienThe anhBienThe;


}