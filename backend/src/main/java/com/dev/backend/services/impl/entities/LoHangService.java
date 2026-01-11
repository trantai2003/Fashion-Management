package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.LoHang;
import com.dev.backend.repository.LoHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoHangService extends BaseServiceImpl<LoHang, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public LoHangService(LoHangRepository repository) {
        super(repository);
    }

}
