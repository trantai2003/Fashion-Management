package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.BienTheSanPham;
import com.dev.backend.repository.BienTheSanPhamRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BienTheSanPhamService extends BaseServiceImpl<BienTheSanPham, Integer> {

    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }


    public BienTheSanPhamService(BienTheSanPhamRepository repository) {
        super(repository);
    }

    public BienTheSanPhamRepository bienTheSanPhamRepository = (BienTheSanPhamRepository) getRepository();


    public Optional<BienTheSanPham> checkExist(
            Integer sanPhamId,
            Integer mauSacId,
            Integer sizeId,
            String maSku,
            String maVachSku
    ) {
        return bienTheSanPhamRepository.checkExist(sanPhamId, mauSacId, sizeId, maSku, maVachSku);
    }


}
