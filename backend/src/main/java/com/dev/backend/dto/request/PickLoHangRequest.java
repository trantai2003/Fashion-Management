package com.dev.backend.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PickLoHangRequest {
    // ID dòng gốc (lo_hang_id = null)
    Integer chiTietPhieuXuatKhoId;
    List<Item> loHangPicks;
    @Data
    public static class Item {
        Integer loHangId;
        BigDecimal soLuongXuat;
    }
}
