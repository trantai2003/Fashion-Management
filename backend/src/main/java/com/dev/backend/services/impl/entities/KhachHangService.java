package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.DonMuaHang;

import com.dev.backend.entities.KhachHang;
import com.dev.backend.repository.KhachHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KhachHangService extends BaseServiceImpl<KhachHang, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public KhachHangService(KhachHangRepository repository) {
        super(repository);
    }
}
