package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.Size;
import com.dev.backend.repository.SizeRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SizeService extends BaseServiceImpl<Size,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public SizeService(SizeRepository repository) {
        super(repository);
    }
}
