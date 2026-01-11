package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.LichSuGiaoDichKho;
import com.dev.backend.repository.LichSuGiaoDichKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LichSuGiaoDichKhoService extends BaseServiceImpl<LichSuGiaoDichKho,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public LichSuGiaoDichKhoService(LichSuGiaoDichKhoRepository repository) {
        super(repository);
    }

}
