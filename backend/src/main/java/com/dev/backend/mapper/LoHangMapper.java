package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.LoHangDto;
import com.dev.backend.entities.LoHang;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LoHangMapper {
    LoHang toEntity(LoHangDto loHangDto);

    LoHangDto toDto(LoHang loHang);

    List<LoHangDto> toDtoList(List<LoHang> list);

    default Page<LoHangDto> toDtoPage(Page<LoHang> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }

}