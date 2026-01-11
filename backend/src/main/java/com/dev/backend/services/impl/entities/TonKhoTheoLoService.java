package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.TonKhoTheoLo;
import com.dev.backend.repository.TonKhoTheoLoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TonKhoTheoLoService extends BaseServiceImpl<TonKhoTheoLo, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public TonKhoTheoLoService(TonKhoTheoLoRepository repository) {
        super(repository);
    }
}
