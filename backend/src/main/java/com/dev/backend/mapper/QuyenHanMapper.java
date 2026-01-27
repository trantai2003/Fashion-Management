package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.QuyenHanDto;
import com.dev.backend.entities.QuyenHan;
import org.mapstruct.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuyenHanMapper {

    QuyenHanDto toDto(QuyenHan quyenHan);

    List<QuyenHanDto> toDtoList(List<QuyenHan> list);

    default Page<QuyenHanDto> toDtoPage(Page<QuyenHan> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}