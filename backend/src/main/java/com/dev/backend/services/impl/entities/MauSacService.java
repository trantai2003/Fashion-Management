package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.MauSac;
import com.dev.backend.repository.MauSacRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.dev.backend.exception.customize.CommonException;

@Service
public class MauSacService extends BaseServiceImpl<MauSac, Integer> {
    private final MauSacRepository mauSacRepository;
    private final EntityManager entityManager;

    @Autowired
    public MauSacService(MauSacRepository repository, EntityManager entityManager) {
        super(repository);
        this.mauSacRepository = repository;
        this.entityManager = entityManager;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    @Override
    @Transactional
    public MauSac create(MauSac mauSac) {
        if (mauSacRepository.existsByMaMau(mauSac.getMaMau())) {
            throw new CommonException("Mã màu sắc " + mauSac.getMaMau() + " đã tồn tại trong hệ thống");
        }
        if (mauSacRepository.existsByTenMau(mauSac.getTenMau())) {
            throw new CommonException("Tên màu sắc '" + mauSac.getTenMau() + "' đã tồn tại trong hệ thống");
        }
        if (mauSac.getMaMauHex() != null && mauSacRepository.existsByMaMauHex(mauSac.getMaMauHex())) {
            throw new CommonException("Mã màu Hex '" + mauSac.getMaMauHex() + "' đã tồn tại trong hệ thống");
        }
        return super.create(mauSac);
    }

    @Override
    @Transactional
    public MauSac update(Integer id, MauSac mauSac) {
        MauSac existing = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy màu sắc để cập nhật"));
        
        if (!existing.getMaMau().equalsIgnoreCase(mauSac.getMaMau()) && mauSacRepository.existsByMaMau(mauSac.getMaMau())) {
            throw new CommonException("Mã màu sắc " + mauSac.getMaMau() + " đã tồn tại trong hệ thống");
        }
        if (!existing.getTenMau().equalsIgnoreCase(mauSac.getTenMau()) && mauSacRepository.existsByTenMau(mauSac.getTenMau())) {
            throw new CommonException("Tên màu sắc '" + mauSac.getTenMau() + "' đã tồn tại trong hệ thống");
        }
        if (mauSac.getMaMauHex() != null && !existing.getMaMauHex().equalsIgnoreCase(mauSac.getMaMauHex()) 
                && mauSacRepository.existsByMaMauHex(mauSac.getMaMauHex())) {
            throw new CommonException("Mã màu Hex '" + mauSac.getMaMauHex() + "' đã tồn tại trong hệ thống");
        }
        
        return super.update(id, mauSac);
    }
}
