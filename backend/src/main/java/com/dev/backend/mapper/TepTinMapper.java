package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.TepTinDto;
import com.dev.backend.entities.TepTin;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.data.domain.Page;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TepTinMapper {
    default TepTinDto toDto(TepTin tepTin) {
        if (tepTin == null) {
            return null;
        }
        String duongDan = tepTin.getDuongDan();
        // nếu đường dẫn bắt đầu bằng http://171.244.142.43 thay bằng https://v2.slmglobal.vn
        if (duongDan != null && duongDan.startsWith("http://171.244.142.43:9000")) {
            duongDan = "https://minio.slmglobal.vn" + duongDan.substring(26);
        }
        return TepTinDto.builder()
                .id(tepTin.getId())
                .tenTepGoc(tepTin.getTenTepGoc())
                .tenTaiLen(tepTin.getTenTaiLen())
                .tenLuuTru(tepTin.getTenLuuTru())
                .duongDan(duongDan)
                .loaiTepTin(tepTin.getLoaiTepTin())
                .duoiTep(tepTin.getDuoiTep())
                .kichCo(tepTin.getKichCo())
                .moTa(tepTin.getMoTa())
                .ngayTao(tepTin.getNgayTao())
                .ngayCapNhat(tepTin.getNgayCapNhat())
                .trangThai(tepTin.getTrangThai())
                .build();
    }

    default Page<TepTinDto> toDtoPage(Page<TepTin> tepTinPage) {
        if (tepTinPage == null) {
            return Page.empty();
        }
        return tepTinPage.map(this::toDto);
    }
}