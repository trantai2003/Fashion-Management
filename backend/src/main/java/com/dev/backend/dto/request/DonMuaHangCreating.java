package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class DonMuaHangCreating {
    Instant ngayDatHang;
    Instant ngayGiaoDuKien;
    String ghiChu;
    List<ChiTietDonMuaHangCreating> chiTietDonMuaHangs;
}
