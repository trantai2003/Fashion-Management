package com.dev.backend.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = "nguoiDungId")
public class ApplicationRequestObj {
    Integer nguoiDungId;
    Integer khoId;
    List<Integer> bienTheSanPhamIds;
    String ghiChu;
    @Builder.Default
    Integer trangThai = 1; // 1 là đã gửi, 2 là duyệt, 0 là đã xoá
    @Builder.Default
    Instant taoLuc = Instant.now();
}
