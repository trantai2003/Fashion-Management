package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.NhaCungCapCreating;
import com.dev.backend.dto.request.NhaCungCapUpdating;
import com.dev.backend.dto.response.entities.NhaCungCapDto;
import com.dev.backend.entities.NhaCungCap;
import com.dev.backend.mapper.NhaCungCapMapper;
import com.dev.backend.repository.NhaCungCapRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhaCungCapService extends BaseServiceImpl<NhaCungCap, Integer> {

    private final NhaCungCapRepository repository;
    private final NhaCungCapMapper mapper;
    private final EntityManager entityManager;

    @Autowired
    public NhaCungCapService(NhaCungCapRepository repository,
                             NhaCungCapMapper mapper,
                             EntityManager entityManager) {
        super(repository);
        this.repository = repository;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public List<NhaCungCapDto> findAll(String searchKeyword) {
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return repository.findAll().stream()
                    .map(mapper::toDto)
                    .collect(Collectors.toList());
        }

        List<NhaCungCap> entities = repository.findByMaNhaCungCapContainingIgnoreCaseOrTenNhaCungCapContainingIgnoreCase(
                searchKeyword, searchKeyword);
        return mapper.toDtoList(entities);
    }

    public NhaCungCapDto findByIdDto(Integer id) {
        NhaCungCap entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));
        return mapper.toDto(entity);
    }

    @Transactional
    public NhaCungCapDto create(NhaCungCapCreating creating) {
        if (repository.existsByMaNhaCungCap(creating.getMaNhaCungCap())) {
            throw new IllegalArgumentException("Mã nhà cung cấp '" + creating.getMaNhaCungCap() + "' đã tồn tại. Vui lòng chọn mã khác.");
        }

        NhaCungCap entity = mapper.toEntity(creating);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Transactional
    public NhaCungCapDto update(Integer id, NhaCungCapUpdating updating) {
        NhaCungCap entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        mapper.partialUpdate(updating, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id);
        }
        repository.deleteById(id);
    }
}