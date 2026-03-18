package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.BienTheSanPhamDto;
import com.dev.backend.entities.BienTheSanPham;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BienTheSanPhamMapper {
    @Mapping(source = "sanPham.tenSanPham", target = "tenSanPham")
    BienTheSanPhamDto toDto(BienTheSanPham entity);
    List<BienTheSanPhamDto> toDtoList(List<BienTheSanPham> entities);
}