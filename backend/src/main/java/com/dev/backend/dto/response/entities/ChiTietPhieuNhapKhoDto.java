package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChiTietPhieuNhapKhoDto {
    Integer id;
    String soPhieuNhap;
    Integer trangThai;
    Instant ngayNhap;
    Integer donMuaHangId;
    String soDonMua;
    Integer nhaCungCapId;
    String tenNhaCungCap;
    Integer khoId;
    String tenKho;
    List<PhieuNhapKhoItemDto> items;
}
