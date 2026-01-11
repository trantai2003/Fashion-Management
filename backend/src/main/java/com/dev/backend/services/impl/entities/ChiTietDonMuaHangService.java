package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietDonMuaHang;
import com.dev.backend.repository.ChiTietDonMuaHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChiTietDonMuaHangService extends BaseServiceImpl<ChiTietDonMuaHang, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public ChiTietDonMuaHangService(ChiTietDonMuaHangRepository repository) {
        super(repository);
    }

}
