package com.dev.backend.mapper;
import com.dev.backend.dto.response.entities.PhieuNhapKhoDto;
import com.dev.backend.entities.PhieuNhapKho;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PhieuNhapKhoMapper {

    @Mapping(source = "donMuaHang.soDonMua", target = "soDonMua")
    @Mapping(source = "nhaCungCap.tenNhaCungCap", target = "tenNhaCungCap")
    @Mapping(source = "kho.tenKho", target = "tenKho")
    PhieuNhapKhoDto toDto(PhieuNhapKho entity);

    List<PhieuNhapKhoDto> toDtoList(List<PhieuNhapKho> entities);
}
