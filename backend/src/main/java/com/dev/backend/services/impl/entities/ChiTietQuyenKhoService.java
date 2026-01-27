package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietQuyenKho;
import com.dev.backend.repository.ChiTietQuyenKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChiTietQuyenKhoService extends BaseServiceImpl<ChiTietQuyenKho, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public ChiTietQuyenKhoService(ChiTietQuyenKhoRepository repository) {
        super(repository);
    }

    private ChiTietQuyenKhoRepository chiTietQuyenKhoRepository = (ChiTietQuyenKhoRepository) getRepository();

    public Optional<ChiTietQuyenKho> findByPhanQuyenNguoiDungKhoIdAndQuyenHanId(Integer khoId, Integer quyenHanId){
        return chiTietQuyenKhoRepository.findByPhanQuyenNguoiDungKhoIdAndQuyenHanId(khoId, quyenHanId);
    }
}
