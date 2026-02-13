package com.dev.backend.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class DonMuaHangBaoGia {
    Integer id;
    Integer trangThai;
    BigDecimal tongTien;
    String ghiChu;
    List<ChiTietDonMuaHangBaoGia> chiTietDonMuaHangBaoGias;
}
