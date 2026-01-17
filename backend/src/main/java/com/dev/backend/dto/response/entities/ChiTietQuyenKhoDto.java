package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

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
