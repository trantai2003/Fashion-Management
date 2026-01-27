package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.MauSacDto;
import com.dev.backend.entities.MauSac;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MauSacMapper {

    MauSacDto toDto(MauSac mauSac);

    List<MauSacDto> toDtoList(List<MauSac> list);
}