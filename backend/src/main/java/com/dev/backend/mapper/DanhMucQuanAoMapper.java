package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.DanhMucQuanAoDto;
import com.dev.backend.entities.DanhMucQuanAo;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface DanhMucQuanAoMapper {

    DanhMucQuanAoDto toDto(DanhMucQuanAo danhMucQuanAo);

    List<DanhMucQuanAoDto> toDtoList(List<DanhMucQuanAo> list);
}