package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;
import java.util.Set;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "danh_muc_quan_ao")
public class DanhMucQuanAo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_danh_muc", nullable = false, length = 50)
    String maDanhMuc;

    @Size(max = 100)
    @NotNull
    @Column(name = "ten_danh_muc", nullable = false, length = 100)
    String tenDanhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_cha_id")
    DanhMucQuanAo danhMucCha;


    @Column(name = "mo_ta")
    String moTa;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    Integer trangThai;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    Instant ngayTao;

    @OneToMany(mappedBy = "danhMucCha", fetch = FetchType.LAZY)
    Set<DanhMucQuanAo> danhMucCons;

}