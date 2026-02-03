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
@Table(name = "ton_kho_theo_lo")
public class TonKhoTheoLo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lo_hang_id", nullable = false)
    LoHang loHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    Kho kho;

    @ColumnDefault("0.000")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_ton", precision = 15, scale = 3)
    BigDecimal soLuongTon;

    @ColumnDefault("0.000")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_da_dat", precision = 15, scale = 3)
    BigDecimal soLuongDaDat;

    @ColumnDefault("(`so_luong_ton` - `so_luong_da_dat`)")
    @Generated(event = EventType.INSERT)
    @Column(name = "so_luong_kha_dung", precision = 15, scale = 3)
    BigDecimal soLuongKhaDung;

    @Column(name = "ngay_nhap_gan_nhat")
    Instant ngayNhapGanNhat;

    @Column(name = "ngay_xuat_gan_nhat")
    Instant ngayXuatGanNhat;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "lan_cap_nhat_cuoi")
    Instant lanCapNhatCuoi;


}