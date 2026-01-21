package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.MauSacCreating;
import com.dev.backend.dto.request.MauSacUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.MauSacDto;
import com.dev.backend.entities.MauSac;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.MauSacMapper;
import com.dev.backend.repository.MauSacRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class MauSacService extends BaseServiceImpl<MauSac, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private MauSacRepository mauSacRepository;

    @Autowired
    private MauSacMapper mauSacMapper;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public MauSacService(MauSacRepository repository) {
        super(repository);
    }

    @Transactional
    public ResponseEntity<ResponseData<MauSacDto>> create(MauSacCreating creating) {
        Optional<MauSac> existing = mauSacRepository.findByMaMau(creating.getMaMau());
        if (existing.isPresent()) {
            throw new CommonException("Mã màu đã tồn tại");
        }

        MauSac entity = new MauSac();
        entity.setMaMau(creating.getMaMau());
        entity.setTenMau(creating.getTenMau());
        entity.setMaMauHex(creating.getMaMauHex());
        entity = create(entity);

        return ResponseEntity.ok(
                ResponseData.<MauSacDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(mauSacMapper.toDto(entity))
                        .message("Success")
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<MauSacDto>> update(MauSacUpdating updating) {
        Optional<MauSac> existingByCode = mauSacRepository.findByMaMau(updating.getMaMau());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(updating.getId())) {
            throw new CommonException("Mã màu đã tồn tại");
        }

        MauSac entity = getOne(updating.getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy màu id: " + updating.getId()));

        entity.setMaMau(updating.getMaMau());
        entity.setTenMau(updating.getTenMau());
        entity.setMaMauHex(updating.getMaMauHex());
        entity = update(entity.getId(), entity);

        return ResponseEntity.ok(
                ResponseData.<MauSacDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(mauSacMapper.toDto(entity))
                        .message("Success")
                        .build()
        );
    }
}
