package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.TepTin}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class TepTinDto implements Serializable {
    Integer id;
    String tenTepGoc;
    String tenTaiLen;
    String tenLuuTru;
    String duongDan;
    String loaiTepTin;
    String duoiTep;
    Integer kichCo;
    String moTa;
    Instant ngayTao;
    Instant ngayCapNhat;
    Integer trangThai;
}