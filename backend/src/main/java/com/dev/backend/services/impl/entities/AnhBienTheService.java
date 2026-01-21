package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.AnhBienThe;
import com.dev.backend.repository.AnhBienTheRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnhBienTheService extends BaseServiceImpl<AnhBienThe, Integer> {

    @Autowired
    private EntityManager entityManager;

    public AnhBienTheService(AnhBienTheRepository repository) {
        super(repository);
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }
}
