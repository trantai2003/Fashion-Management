package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SizeUpdating {
    Integer id;
    String maSize;
    String tenSize;
    String loaiSize;
    Integer thuTuSapXep;
    String moTa;
}
