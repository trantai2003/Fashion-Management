package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.DonMuaHangDto;
import com.dev.backend.entities.DonMuaHang;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DonMuaHangMapper {
    DonMuaHang toEntity(DonMuaHangDto donMuaHangDto);

    DonMuaHangDto toDto(DonMuaHang donMuaHang);

    List<DonMuaHangDto> toDtoList(List<DonMuaHang> list);

    default Page<DonMuaHangDto> toDtoPage(Page<DonMuaHang> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}