package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TonKhoTheoLoDto {
    Integer loHangId;
    String maLo;
    Instant ngayNhapGanNhat;
    BigDecimal soLuongKhaDung;
}
