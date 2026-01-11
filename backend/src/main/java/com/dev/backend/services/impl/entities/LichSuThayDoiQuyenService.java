package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.LichSuThayDoiQuyen;
import com.dev.backend.repository.LichSuThayDoiQuyenRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LichSuThayDoiQuyenService extends BaseServiceImpl<LichSuThayDoiQuyen,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public LichSuThayDoiQuyenService(LichSuThayDoiQuyenRepository repository) {
        super(repository);
    }

}
