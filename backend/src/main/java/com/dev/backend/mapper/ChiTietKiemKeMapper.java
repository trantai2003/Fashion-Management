// src/main/java/com/dev/backend/mapper/ChiTietKiemKeMapper.java
package com.dev.backend.mapper;

import com.dev.backend.dto.request.ChiTietKiemKeUpdate;
import com.dev.backend.dto.response.entities.ChiTietKiemKeDto;
import com.dev.backend.entities.ChiTietKiemKe;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ChiTietKiemKeMapper {

    ChiTietKiemKeDto toDto(ChiTietKiemKe entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(ChiTietKiemKeUpdate update, @MappingTarget ChiTietKiemKe entity);
}