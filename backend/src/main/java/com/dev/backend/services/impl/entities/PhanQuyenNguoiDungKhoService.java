package com.dev.backend.services.impl.entities;


import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import com.dev.backend.repository.PhanQuyenNguoiDungKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PhanQuyenNguoiDungKhoService extends BaseServiceImpl<PhanQuyenNguoiDungKho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhanQuyenNguoiDungKhoService(PhanQuyenNguoiDungKhoRepository repository) {
        super(repository);
    }
}
