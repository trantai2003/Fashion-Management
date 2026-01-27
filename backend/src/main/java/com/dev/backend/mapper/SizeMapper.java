package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.SizeDto;
import com.dev.backend.entities.Size;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SizeMapper {

    SizeDto toDto(Size size);

    List<SizeDto> toDtoList(List<Size> list);

}