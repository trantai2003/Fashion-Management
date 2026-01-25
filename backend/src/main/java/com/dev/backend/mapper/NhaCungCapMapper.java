package com.dev.backend.mapper;

import com.dev.backend.dto.request.NhaCungCapCreating;
import com.dev.backend.dto.request.NhaCungCapUpdating;
import com.dev.backend.dto.response.entities.NhaCungCapDto;
import com.dev.backend.entities.NhaCungCap;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NhaCungCapMapper {

    NhaCungCap toEntity(NhaCungCapCreating dto);

    NhaCungCapDto toDto(NhaCungCap entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(NhaCungCapUpdating dto, @MappingTarget NhaCungCap entity);

    java.util.List<NhaCungCapDto> toDtoList(java.util.List<NhaCungCap> entities);
}