package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "danh_muc_quan_ao")
public class DanhMucQuanAo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_danh_muc", nullable = false, length = 50)
    private String maDanhMuc;

    @Size(max = 100)
    @NotNull
    @Column(name = "ten_danh_muc", nullable = false, length = 100)
    private String tenDanhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_cha_id")
    private DanhMucQuanAo danhMucCha;

    
    @Column(name = "mo_ta")
    private String moTa;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @OneToMany(mappedBy = "danhMucCha",fetch = FetchType.LAZY)
    private Set<DanhMucQuanAo> danhMucCons;

}