// src/main/java/com/dev/backend/dto/request/ChiTietKiemKeUpdate.java
package com.dev.backend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKiemKeUpdate {
    private Integer chiTietId;
    private Integer soLuongThucTe;
}