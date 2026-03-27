package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.AnhBienTheDto;
import com.dev.backend.entities.AnhBienThe;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {TepTinMapper.class})
public interface AnhBienTheMapper {

    AnhBienTheDto toDto(AnhBienThe anhBienThe);
}