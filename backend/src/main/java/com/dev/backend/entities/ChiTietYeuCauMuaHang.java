package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "chi_tiet_yeu_cau_mua_hang")
public class ChiTietYeuCauMuaHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "yeu_cau_mua_hang_id", nullable = false)
    private YeuCauMuaHang yeuCauMuaHang;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bien_the_san_pham_id", nullable = false)
    private BienTheSanPham bienTheSanPham;

    @NotNull
    @Column(name = "so_luong_dat", nullable = false, precision = 15, scale = 3)
    private BigDecimal soLuongDat;

    @Column(name = "ghi_chu")
    private String ghiChu;


}