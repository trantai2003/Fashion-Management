package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.io.Serializable;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class KhoDto implements Serializable {
    Integer id;
    String maKho;
    String tenKho;
    String diaChi;
    NguoiDungDto quanLy;
    Integer trangThai;
    Instant ngayTao;
}
