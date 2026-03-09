// src/main/java/com/dev/backend/dto/request/PhieuKiemKeCreate.java
package com.dev.backend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuKiemKeCreate {
    private Integer khoId;
    private String ghiChu;
}