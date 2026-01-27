package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.SanPhamQuanAo;
import com.dev.backend.repository.SanPhamQuanAoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SanPhamQuanAoService extends BaseServiceImpl<SanPhamQuanAo,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public SanPhamQuanAoService(SanPhamQuanAoRepository repository) {
        super(repository);
    }

}
