package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class YeuCauDenNhaCungCapCreating {
    Integer yeuCauMuaHangId;
    String ghiChu;
    List<Integer> nhaCungCapIds;
}
