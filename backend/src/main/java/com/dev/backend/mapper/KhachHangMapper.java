package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.entities.KhachHang;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.data.domain.Page;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface KhachHangMapper {
    KhachHang toEntity(KhachHangDto khachHangDto);

    KhachHangDto toDto(KhachHang khachHang);

    default Page<KhachHangDto> toDtoPage(Page<KhachHang> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}