package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.SizeCreating;
import com.dev.backend.dto.request.SizeUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.SizeDto;
import com.dev.backend.entities.Size;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.SizeMapper;
import com.dev.backend.repository.SizeRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SizeService extends BaseServiceImpl<Size, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private SizeMapper sizeMapper;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public SizeService(SizeRepository repository) {
        super(repository);
    }

    @Transactional
    public ResponseEntity<ResponseData<SizeDto>> create(SizeCreating creating) {
        Optional<Size> existing = sizeRepository.findByMaSize(creating.getMaSize());
        if (existing.isPresent()) {
            throw new CommonException("Mã size đã tồn tại");
        }

        Size entity = new Size();
        entity.setMaSize(creating.getMaSize());
        entity.setTenSize(creating.getTenSize());
        entity.setLoaiSize(creating.getLoaiSize());
        entity.setThuTuSapXep(creating.getThuTuSapXep());
        entity.setMoTa(creating.getMoTa());
        entity = create(entity);

        return ResponseEntity.ok(
                ResponseData.<SizeDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(sizeMapper.toDto(entity))
                        .message("Success")
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<SizeDto>> update(SizeUpdating updating) {
        Optional<Size> existingByCode = sizeRepository.findByMaSize(updating.getMaSize());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(updating.getId())) {
            throw new CommonException("Mã size đã tồn tại");
        }

        Size entity = getOne(updating.getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy size id: " + updating.getId()));

        entity.setMaSize(updating.getMaSize());
        entity.setTenSize(updating.getTenSize());
        entity.setLoaiSize(updating.getLoaiSize());
        entity.setThuTuSapXep(updating.getThuTuSapXep());
        entity.setMoTa(updating.getMoTa());
        entity = update(entity.getId(), entity);

        return ResponseEntity.ok(
                ResponseData.<SizeDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(sizeMapper.toDto(entity))
                        .message("Success")
                        .build()
        );
    }
}
