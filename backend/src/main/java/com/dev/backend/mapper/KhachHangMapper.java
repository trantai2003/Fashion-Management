// src/main/java/com/dev/backend/mapper/KhachHangMapper.java
package com.dev.backend.mapper;

import com.dev.backend.dto.request.KhachHangUpdating;
import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.entities.KhachHang;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface KhachHangMapper {

    KhachHangDto toDto(KhachHang entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(KhachHangUpdating dto, @MappingTarget KhachHang entity);
}