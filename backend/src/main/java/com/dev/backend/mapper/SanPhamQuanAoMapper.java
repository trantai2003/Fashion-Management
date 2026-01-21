package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.entities.SanPhamQuanAo;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface SanPhamQuanAoMapper {
    SanPhamQuanAoDto toDto(SanPhamQuanAo sanPhamQuanAo);

    List<SanPhamQuanAoDto> toDtoList(List<SanPhamQuanAo> list);

    default Page<SanPhamQuanAoDto> toDtoPage(Page<SanPhamQuanAo> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}