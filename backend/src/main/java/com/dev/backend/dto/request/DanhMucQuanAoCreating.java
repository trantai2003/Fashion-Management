package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DanhMucQuanAoCreating {
    String maDanhMuc;
    String tenDanhMuc;
    Integer danhMucChaId;
    String moTa;
    Integer trangThai;
}
