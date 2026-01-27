package com.dev.backend.mapper;

import com.dev.backend.dto.response.entities.ChatLieuDto;
import com.dev.backend.entities.ChatLieu;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ChatLieuMapper {

    ChatLieuDto toDto(ChatLieu chatLieu);

    List<ChatLieuDto> toDtoList(List<ChatLieu> list);
}