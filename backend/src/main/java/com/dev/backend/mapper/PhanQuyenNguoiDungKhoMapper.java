package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.PhanQuyenNguoiDungKhoDto;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PhanQuyenNguoiDungKhoMapper {
    @Mapping(target = "nguoiDung", ignore = true)
    @Mapping(target = "nguoiCapQuyen", ignore = true)
    @Mapping(target = "kho.quanLy", ignore = true)
    PhanQuyenNguoiDungKhoDto toDto(PhanQuyenNguoiDungKho phanQuyenNguoiDungKho);

    List<PhanQuyenNguoiDungKhoDto> toDtoList(List<PhanQuyenNguoiDungKho> list);

    default Page<PhanQuyenNguoiDungKhoDto> toDtoPage(Page<PhanQuyenNguoiDungKho> page) {
        if (page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}