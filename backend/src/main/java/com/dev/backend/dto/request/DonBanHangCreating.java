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
public class DonBanHangCreating {
    private String soDonHang;
    private Integer khachHangId;
    Integer khoXuatId;
    private String diaChiGiaoHang;
    private BigDecimal phiVanChuyen;
    private String ghiChu;
    private List<ChiTietDonBanHangCreating> chiTiet;
}

