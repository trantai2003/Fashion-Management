package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.ChiTietQuyenKhoDto;
import com.dev.backend.entities.ChiTietQuyenKho;
import org.mapstruct.*;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface ChiTietQuyenKhoMapper {
    ChiTietQuyenKhoDto toDto(ChiTietQuyenKho chiTietQuyenKho);
    List<ChiTietQuyenKhoDto> toDtoList(List<ChiTietQuyenKho> chiTietQuyenKhos);
}