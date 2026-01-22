package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.DanhMucQuanAo;
import com.dev.backend.repository.DanhMucQuanAoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DanhMucQuanAoService extends BaseServiceImpl<DanhMucQuanAo, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public DanhMucQuanAoService(DanhMucQuanAoRepository repository) {
        super(repository);
    }
}
