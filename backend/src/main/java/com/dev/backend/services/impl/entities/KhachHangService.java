// src/main/java/com/dev/backend/services/impl/entities/KhachHangService.java
package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.KhachHangUpdating;
import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.entities.KhachHang;
import com.dev.backend.mapper.KhachHangMapper;
import com.dev.backend.repository.KhachHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KhachHangService extends BaseServiceImpl<KhachHang, Integer> {

    private final KhachHangRepository repository;
    private final KhachHangMapper mapper;
    private final EntityManager entityManager;

    @Autowired
    public KhachHangService(KhachHangRepository repository,
                            KhachHangMapper mapper,
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

    // Function Customer Details
    public KhachHangDto findByIdDto(Integer id) {
        KhachHang entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));
        return mapper.toDto(entity);
    }

    // Function Edit Customer
    @Transactional
    public KhachHangDto update(Integer id, KhachHangUpdating updating) {
        KhachHang entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));

        mapper.partialUpdate(updating, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}