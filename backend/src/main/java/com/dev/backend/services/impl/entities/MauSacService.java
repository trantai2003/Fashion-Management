package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.MauSac;
import com.dev.backend.repository.MauSacRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MauSacService extends BaseServiceImpl<MauSac,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public MauSacService(MauSacRepository repository) {
        super(repository);
    }
}
