package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhieuXuatKhoMapper {
    @Mapping(target = "soDonHang", source = "donBanHang.soDonHang")
    @Mapping(target = "tenKho", source = "kho.tenKho")
    PhieuXuatKhoDto toDto(PhieuXuatKho entity);
}
