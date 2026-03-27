package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.AnhQuanAoDto;
import com.dev.backend.entities.AnhQuanAo;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {TepTinMapper.class})
public interface AnhQuanAoMapper {
    AnhQuanAoDto toDto(AnhQuanAo anhQuanAo);
}