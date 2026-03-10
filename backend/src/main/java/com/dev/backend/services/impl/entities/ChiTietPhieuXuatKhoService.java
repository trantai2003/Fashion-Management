package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChiTietPhieuXuatKho;
import com.dev.backend.repository.ChiTietPhieuXuatKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietPhieuXuatKhoService extends BaseServiceImpl<ChiTietPhieuXuatKho, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    private final ChiTietPhieuXuatKhoRepository chiTietPhieuXuatKhoRepository = (ChiTietPhieuXuatKhoRepository) getRepository();

    public ChiTietPhieuXuatKhoService(ChiTietPhieuXuatKhoRepository repository) {
        super(repository);
    }

    public List<Integer> findTopSanPham(Integer top){
        return chiTietPhieuXuatKhoRepository.findTopSanPham(top);
    }
}
