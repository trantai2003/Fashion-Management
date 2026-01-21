package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.DanhMucQuanAoDto;
import com.dev.backend.entities.DanhMucQuanAo;
import org.mapstruct.*;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface DanhMucQuanAoMapper {
    DanhMucQuanAo toEntity(DanhMucQuanAoDto danhMucQuanAoDto);

    DanhMucQuanAoDto toDto(DanhMucQuanAo danhMucQuanAo);

    List<DanhMucQuanAoDto> toDtoList(List<DanhMucQuanAo> list);
}