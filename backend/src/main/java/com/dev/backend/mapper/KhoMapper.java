package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.KhoDto;
import com.dev.backend.entities.Kho;
import org.mapstruct.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface KhoMapper {

    KhoDto toDto(Kho kho);
    List<KhoDto> toDtoList(List<Kho> list);
    default Page<KhoDto> toDtoPage(Page<Kho> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}