package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class YeuCauMuaHangCreating {
    Integer khoNhapId;
    Instant ngayGiaoDuKien;
    String ghiChu;
    List<ChiTietYeuCauMuaHangCreating> chiTietYeuCauMuaHangs;
}
