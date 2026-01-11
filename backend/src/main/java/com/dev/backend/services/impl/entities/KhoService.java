package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.Kho;
import com.dev.backend.repository.KhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KhoService extends BaseServiceImpl<Kho,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public KhoService(KhoRepository repository) {
        super(repository);
    }
}
