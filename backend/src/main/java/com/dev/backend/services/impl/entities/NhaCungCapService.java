package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.NhaCungCap;
import com.dev.backend.repository.NhaCungCapRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NhaCungCapService extends BaseServiceImpl<NhaCungCap,Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public NhaCungCapService(NhaCungCapRepository repository) {
        super(repository);
    }

}
