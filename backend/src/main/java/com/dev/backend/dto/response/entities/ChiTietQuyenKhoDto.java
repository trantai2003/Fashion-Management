package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.ChiTietQuyenKho}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class ChiTietQuyenKhoDto implements Serializable {
    Integer id;
    QuyenHanDto quyenHan;
    Integer trangThai;
    Instant ngayCap;
    NguoiDungDto nguoiCap;

    public String getMaQuyenHan(){
        return getQuyenHan().getMaQuyen();
    }
}