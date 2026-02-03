package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "tep_tin")
public class TepTin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 1000)
    @Column(name = "ten_tep_goc", length = 1000)
    String tenTepGoc;

    @Size(max = 1000)
    @Column(name = "ten_tai_len", length = 1000)
    String tenTaiLen;

    @Size(max = 255)
    @NotNull
    @Column(name = "ten_luu_tru", nullable = false)
    String tenLuuTru;


    @Column(name = "duong_dan")
    String duongDan;

    @Size(max = 100)
    @Column(name = "loai_tep_tin", length = 100)
    String loaiTepTin;

    @Size(max = 10)
    @Column(name = "duoi_tep", length = 10)
    String duoiTep;

    @Column(name = "kich_co")
    Integer kichCo;

    @Size(max = 400)
    @Column(name = "mo_ta", length = 400)
    String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    Instant ngayCapNhat;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    Integer trangThai;


}