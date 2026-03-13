package com.dev.backend.mapper;

import com.dev.backend.dto.response.customize.PhieuXuatKhoSummaryDto;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public interface PhieuXuatKhoMapper {
    @Mapping(source = "phieuChuyenKhoGoc.id", target = "phieuChuyenKhoGocId")
    @Mapping(source = "phieuChuyenKhoGoc.soPhieuXuat", target = "soPhieuChuyenKhoGoc")
    PhieuXuatKhoDto toDto(PhieuXuatKho entity);

    default Page<PhieuXuatKhoDto> toDtoPage(Page<PhieuXuatKho> page){
        if(page.isEmpty()) return Page.empty();
        return page.map(this::toDto);
    }
    @Mapping(source = "id", target = "id")
    @Mapping(source = "soPhieuXuat", target = "soPhieuXuat")
    @Mapping(source = "ngayXuat", target = "ngayXuat")
    @Mapping(source = "trangThai", target = "trangThai")
    @Mapping(source = "ghiChu", target = "ghiChu")
    PhieuXuatKhoSummaryDto toSummaryDto(PhieuXuatKho entity);
}
