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
    String soDonMua;
    Integer nhaCungCapId;
    Instant ngayDatHang;
    Instant ngayGiaoDuKien;
    Integer trangThai; //  2 là gửi duyệt, 3 là đã duyệt và gửi mail nhà cung cấp , 4 là nhà cung cấp đã xác nhận, 5 là đã nhận hàng và thanh toán
    BigDecimal tongTien;
    String ghiChu;
    List<ChiTietDonMuaHangCreating> chiTietDonMuaHangs;
}
