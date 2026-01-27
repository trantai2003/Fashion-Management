package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.entities.NguoiDung;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface NguoiDungMapper {
    NguoiDungDto toDto(NguoiDung entity);
    List<NguoiDungDto> toDtoList(List<NguoiDung> list);

    default Page<NguoiDungDto> toDtoPage(Page<NguoiDung> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}
