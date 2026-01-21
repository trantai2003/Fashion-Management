package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.SizeDto;
import com.dev.backend.entities.Size;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING
)
public interface SizeMapper {

    Size toEntity(SizeDto dto);

    SizeDto toDto(Size entity);

    List<SizeDto> toDtoList(List<Size> list);

    default Page<SizeDto> toDtoPage(Page<Size> page) {
        if (page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Size partialUpdate(SizeDto dto, @MappingTarget Size entity);
}

