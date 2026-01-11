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

@Getter
@Setter
@Entity
@Table(name = "mau_sac")
public class MauSac {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_mau", nullable = false, length = 50)
    private String maMau;

    @Size(max = 100)
    @NotNull
    @Column(name = "ten_mau", nullable = false, length = 100)
    private String tenMau;

    @Size(max = 7)
    @Column(name = "ma_mau_hex", length = 7)
    private String maMauHex;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;


}