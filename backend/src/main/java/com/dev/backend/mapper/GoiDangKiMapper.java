package com.dev.backend.mapper;

import com.dev.backend.dto.response.GoiDangKiDto;
import com.dev.backend.entities.GoiDangKi;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface GoiDangKiMapper {
    GoiDangKiDto toDto(GoiDangKi goiDangKi);

    List<GoiDangKiDto> toDtoList(List<GoiDangKi> list);

    default Page<GoiDangKiDto> toDtoPage(Page<GoiDangKi> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}