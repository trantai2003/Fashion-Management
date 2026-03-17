package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.LichSuGiaoDichKhoDto;
import com.dev.backend.entities.LichSuGiaoDichKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LichSuGiaoDichKhoMapper {

    @Mapping(target = "tenSanPham",      source = "bienTheSanPham.sanPham.tenSanPham")
    @Mapping(target = "maSku",           source = "bienTheSanPham.maSku")
    @Mapping(target = "maLo",            source = "loHang.maLo")
    @Mapping(target = "khoId",           source = "kho.id")
    @Mapping(target = "tenKho",          source = "kho.tenKho")
    @Mapping(target = "khoChuyenDenId",  source = "khoChuyenDen.id")
    @Mapping(target = "tenKhoChuyenDen", source = "khoChuyenDen.tenKho")
    @Mapping(target = "nguoiDungTen",    source = "nguoiDung.tenDangNhap")
    LichSuGiaoDichKhoDto toDto(LichSuGiaoDichKho entity);
}