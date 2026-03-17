package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.response.entities.LichSuGiaoDichKhoDto;
import com.dev.backend.entities.LichSuGiaoDichKho;
import com.dev.backend.mapper.LichSuGiaoDichKhoMapper;
import com.dev.backend.repository.LichSuGiaoDichKhoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichSuGiaoDichKhoService {

    private final LichSuGiaoDichKhoRepository repository;
    private final LichSuGiaoDichKhoMapper mapper;

    @Transactional(readOnly = true)
    public List<LichSuGiaoDichKhoDto> getAll() {
        return repository.findAllWithDetails()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LichSuGiaoDichKhoDto getChiTiet(Integer id) {
        LichSuGiaoDichKho entity = repository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch sử ID: " + id));
        return mapper.toDto(entity);
    }

    @Transactional
    public LichSuGiaoDichKho create(LichSuGiaoDichKho entity) {
        return repository.save(entity);
    }
}