package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietYeuCauMuaHang;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class ChiTietYeuCauMuaHangService extends BaseServiceImpl<ChiTietYeuCauMuaHang, Integer> {

    @Autowired
    private EntityManager entityManager;
    public ChiTietYeuCauMuaHangService(JpaRepository<ChiTietYeuCauMuaHang, Integer> repository) {
        super(repository);
    }

    @Override
    protected EntityManager getEntityManager() {
        return this.entityManager;
    }
}
