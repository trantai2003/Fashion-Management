package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.DanhMucQuanAoDto;
import com.dev.backend.entities.DanhMucQuanAo;
import org.mapstruct.*;

import java.util.List;
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface DanhMucQuanAoMapper {
    List<DanhMucQuanAoDto> toDtoList(List<DanhMucQuanAo> list);
    @Mapping(target = "danhMucCons", qualifiedByName = "mapChildren")
    DanhMucQuanAoDto toDto(DanhMucQuanAo danhMucQuanAo);
    @Named("mapChildren")
    @Mapping(target = "danhMucCha", ignore = true) // NGẮT: Không map cha của con
    @Mapping(target = "danhMucCons", qualifiedByName = "mapChildren") // TIẾP TỤC: Map con của con
    DanhMucQuanAoDto toDtoWithoutParent(DanhMucQuanAo danhMucQuanAo);
}