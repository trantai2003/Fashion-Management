package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.CanhBao;
import com.dev.backend.repository.CanhBaoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class CanhBaoService extends BaseServiceImpl<CanhBao, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public CanhBaoService(CanhBaoRepository repository) {
        super(repository);
    }


}
