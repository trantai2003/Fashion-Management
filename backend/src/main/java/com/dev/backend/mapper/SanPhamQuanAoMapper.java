package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.entities.SanPhamQuanAo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SanPhamQuanAoMapper {
    @Mapping(source = "danhMuc", target = "danhMuc")
    @Mapping(target = "danhMuc.danhMucCons", ignore = true) // Ngắt không cho map danh sách con của danh mục trong sản phẩm
    @Mapping(target = "danhMuc.danhMucCha", ignore = true)
    SanPhamQuanAoDto toDto(SanPhamQuanAo sanPhamQuanAo);

    List<SanPhamQuanAoDto> toDtoList(List<SanPhamQuanAo> list);

    default Page<SanPhamQuanAoDto> toDtoPage(Page<SanPhamQuanAo> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}