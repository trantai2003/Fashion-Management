package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.AnhQuanAo;
import com.dev.backend.repository.AnhQuanAoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnhQuanAoService extends BaseServiceImpl<AnhQuanAo, Integer> {


    @Autowired
    private EntityManager entityManager;

    public AnhQuanAoService(AnhQuanAoRepository repository) {
        super(repository);
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }
}
