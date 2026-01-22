package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.PhanQuyenNguoiDungKhoDto;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PhanQuyenNguoiDungKhoMapper {
    PhanQuyenNguoiDungKhoDto toDto(PhanQuyenNguoiDungKho phanQuyenNguoiDungKho);

    PhanQuyenNguoiDungKho toEntity(PhanQuyenNguoiDungKhoDto phanQuyenNguoiDungKhoDto);

    List<PhanQuyenNguoiDungKhoDto> toDtoList(List<PhanQuyenNguoiDungKho> list);

    default Page<PhanQuyenNguoiDungKhoDto> toDtoPage(Page<PhanQuyenNguoiDungKho> page) {
        if (page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
}