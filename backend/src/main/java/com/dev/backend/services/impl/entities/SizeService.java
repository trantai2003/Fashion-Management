package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.Size;
import com.dev.backend.repository.SizeRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.dev.backend.exception.customize.CommonException;

@Service
public class SizeService extends BaseServiceImpl<Size, Integer> {
    private final SizeRepository sizeRepository;
    private final EntityManager entityManager;

    @Autowired
    public SizeService(SizeRepository repository, EntityManager entityManager) {
        super(repository);
        this.sizeRepository = repository;
        this.entityManager = entityManager;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    @Override
    @Transactional
    public Size create(Size size) {
        if (sizeRepository.existsByMaSize(size.getMaSize())) {
            throw new CommonException(HttpStatus.BAD_REQUEST, "Mã kích cỡ '" + size.getMaSize() + "' đã tồn tại trong hệ thống");
        }
        if (sizeRepository.existsByTenSize(size.getTenSize())) {
            throw new CommonException(HttpStatus.BAD_REQUEST, "Tên kích cỡ '" + size.getTenSize() + "' đã tồn tại trong hệ thống");
        }
        return super.create(size);
    }

    @Override
    @Transactional
    public Size update(Integer id, Size size) {
        Size existing = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy kích cỡ để cập nhật"));
        
        if (!existing.getMaSize().equalsIgnoreCase(size.getMaSize()) && sizeRepository.existsByMaSize(size.getMaSize())) {
            throw new CommonException(HttpStatus.BAD_REQUEST, "Mã kích cỡ '" + size.getMaSize() + "' đã tồn tại trong hệ thống");
        }
        if (!existing.getTenSize().equalsIgnoreCase(size.getTenSize()) && sizeRepository.existsByTenSize(size.getTenSize())) {
            throw new CommonException(HttpStatus.BAD_REQUEST, "Tên kích cỡ '" + size.getTenSize() + "' đã tồn tại trong hệ thống");
        }
        
        return super.update(id, size);
    }
}
