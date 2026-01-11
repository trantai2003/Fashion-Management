package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.QuyenHan;
import com.dev.backend.repository.QuyenHanRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuyenHanService extends BaseServiceImpl<QuyenHan,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public QuyenHanService(QuyenHanRepository repository) {
        super(repository);
    }
}
