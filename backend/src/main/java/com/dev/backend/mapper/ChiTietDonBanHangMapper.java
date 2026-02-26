package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.ChiTietDonBanHangDto;
import com.dev.backend.entities.ChiTietDonBanHang;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChiTietDonBanHangMapper {
    @Mapping(source = "bienTheSanPham.id", target = "bienTheSanPhamId")
    @Mapping(source = "bienTheSanPham.maSku", target = "sku")
    @Mapping(
            expression = "java(entity.getBienTheSanPham().getSanPham().getTenSanPham() + \" / \" + entity.getBienTheSanPham().getMauSac().getTenMau())",
            target = "tenSanPham"
    )
    ChiTietDonBanHangDto toDto(ChiTietDonBanHang entity);
}
