package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.DonBanHang;
import com.dev.backend.repository.DonBanHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DonBanHangService extends BaseServiceImpl<DonBanHang, Integer> {

    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public DonBanHangService(DonBanHangRepository repository) {
        super(repository);
    }

    private final DonBanHangRepository donBanHangRepository =
            (DonBanHangRepository) getRepository();
}
