package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.GoiDangKi;
import com.dev.backend.repository.GoiDangKiRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class GoiDangKiService extends BaseServiceImpl<GoiDangKi, Integer> {

    @Autowired
    private GoiDangKiRepository repository ;

    @Autowired
    private EntityManager entityManager;

    public GoiDangKiService(GoiDangKiRepository repository) {
        super(repository);
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }
}
