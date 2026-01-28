package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.LichSuThayDoi;
import com.dev.backend.repository.LichSuThayDoiRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LichSuThayDoiService extends BaseServiceImpl<LichSuThayDoi,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public LichSuThayDoiService(LichSuThayDoiRepository repository) {
        super(repository);
    }

}
