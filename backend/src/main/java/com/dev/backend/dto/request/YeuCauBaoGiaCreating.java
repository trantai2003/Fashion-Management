package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class YeuCauBaoGiaCreating {
    Integer id;
    String soDonMua;
    Integer nhaCungCapId;
}
