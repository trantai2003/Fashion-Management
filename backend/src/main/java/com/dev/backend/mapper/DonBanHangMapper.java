package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.DonBanHangDto;
import com.dev.backend.entities.DonBanHang;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DonBanHangMapper {

    DonBanHangDto toDto(DonBanHang entity);
}