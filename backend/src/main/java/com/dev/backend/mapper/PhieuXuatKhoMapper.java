package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public interface PhieuXuatKhoMapper {
    PhieuXuatKhoDto toDto(PhieuXuatKho entity);

    default Page<PhieuXuatKhoDto> toDtoPage(Page<PhieuXuatKho> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}
