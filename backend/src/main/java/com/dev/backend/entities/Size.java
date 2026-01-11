package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "size")
public class Size {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @jakarta.validation.constraints.Size(max = 20)
    @NotNull
    @Column(name = "ma_size", nullable = false, length = 20)
    private String maSize;

    @jakarta.validation.constraints.Size(max = 50)
    @NotNull
    @Column(name = "ten_size", nullable = false, length = 50)
    private String tenSize;

    @ColumnDefault("'chu'")
    @Lob
    @Column(name = "loai_size")
    private String loaiSize;

    @ColumnDefault("0")
    @Column(name = "thu_tu_sap_xep")
    private Integer thuTuSapXep;

    @Lob
    @Column(name = "mo_ta")
    private String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;


}