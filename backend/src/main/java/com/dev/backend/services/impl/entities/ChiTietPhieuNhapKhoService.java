package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietPhieuNhapKho;
import com.dev.backend.repository.ChiTietPhieuNhapKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChiTietPhieuNhapKhoService extends BaseServiceImpl<ChiTietPhieuNhapKho, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public ChiTietPhieuNhapKhoService(ChiTietPhieuNhapKhoRepository repository) {
        super(repository);
    }

}
