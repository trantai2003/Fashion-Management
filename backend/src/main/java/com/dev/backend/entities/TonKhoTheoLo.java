package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "ton_kho_theo_lo")
public class TonKhoTheoLo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lo_hang_id", nullable = false)
    private LoHang loHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @ColumnDefault("0.000")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_ton", precision = 15, scale = 3)
    private BigDecimal soLuongTon;

    @ColumnDefault("0.000")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_da_dat", precision = 15, scale = 3)
    private BigDecimal soLuongDaDat;

    @ColumnDefault("(`so_luong_ton` - `so_luong_da_dat`)")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_kha_dung", precision = 15, scale = 3)
    private BigDecimal soLuongKhaDung;

    @Column(name = "ngay_nhap_gan_nhat")
    private Instant ngayNhapGanNhat;

    @Column(name = "ngay_xuat_gan_nhat")
    private Instant ngayXuatGanNhat;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "lan_cap_nhat_cuoi")
    private Instant lanCapNhatCuoi;


}