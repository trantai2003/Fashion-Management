package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

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
    @Generated(event = EventType.INSERT)
    
    @Column(name = "loai_size")
    private String loaiSize;

    @ColumnDefault("0")
    @Generated(event = EventType.INSERT)
    @Column(name = "thu_tu_sap_xep")
    private Integer thuTuSapXep;

    
    @Column(name = "mo_ta")
    private String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;


}