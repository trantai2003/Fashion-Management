package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "anh_kiem_ke")
public class AnhKiemKe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "chi_tiet_kiem_ke_id", nullable = false)
    private ChiTietKiemKe chiTietKiemKe;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tep_tin_id", nullable = false)
    private TepTin tepTin;

    @ColumnDefault("'chi_tiet'")
    @Lob
    @Column(name = "loai_anh")
    private String loaiAnh;

    @Size(max = 500)
    @Column(name = "mo_ta", length = 500)
    private String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_chup")
    private Instant ngayChup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_chup_id")
    private NguoiDung nguoiChup;


}