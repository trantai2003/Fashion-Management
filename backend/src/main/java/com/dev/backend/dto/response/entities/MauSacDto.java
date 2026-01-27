package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.MauSac}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class MauSacDto implements Serializable {
    Integer id;
    String maMau;
    String tenMau;
    String maMauHex;
    Instant ngayTao;
}