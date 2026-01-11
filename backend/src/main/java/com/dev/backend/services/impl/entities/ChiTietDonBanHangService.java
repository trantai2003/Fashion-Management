package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietDonBanHang;
import com.dev.backend.repository.ChiTietDonBanHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChiTietDonBanHangService extends BaseServiceImpl<ChiTietDonBanHang,Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;


    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public ChiTietDonBanHangService(ChiTietDonBanHangRepository repository) {
        super(repository);
    }

}
