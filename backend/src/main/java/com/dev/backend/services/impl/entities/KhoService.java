package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.KhoCreating;
import com.dev.backend.dto.request.KhoUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.KhoDto;
import com.dev.backend.entities.Kho;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.KhoMapper;
import com.dev.backend.repository.KhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class KhoService extends BaseServiceImpl<Kho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public KhoService(KhoRepository repository) {
        super(repository);
    }

    private KhoRepository khoRepository = (KhoRepository) getRepository();

    @Autowired
    private NguoiDungService nguoiDungService;
    @Autowired
    private KhoMapper khoMapper;

    @Transactional
    public ResponseEntity<ResponseData<KhoDto>> create(KhoCreating creating) {

        Optional<NguoiDung> findingQuanLy = nguoiDungService.getOne(creating.getQuanLyId());

        if (findingQuanLy.isEmpty()) {
            throw new CommonException("Không tìm thấy người dùng id: " + creating.getQuanLyId());
        }

        Optional<Kho> findingKho = khoRepository.findByMaKho(creating.getMaKho());
        if (findingKho.isPresent()) {
            throw new CommonException("Mã kho đã tồn tại");
        }
        Kho kho = new Kho();
        kho.setTenKho(creating.getTenKho());
        kho.setMaKho(creating.getMaKho());
        kho.setDiaChi(creating.getDiaChi());
        kho.setQuanLy(findingQuanLy.get());
        kho.setTrangThai(creating.getTrangThai());
        kho = create(kho);
        return ResponseEntity.ok(
                ResponseData.<KhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(khoMapper.toDto(kho))
                        .message("Success")
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<KhoDto>> update(KhoUpdating updating) {

        Optional<NguoiDung> findingQuanLy = nguoiDungService.getOne(updating.getQuanLyId());
        if (findingQuanLy.isEmpty()) {
            throw new CommonException("Không tìm thấy người dùng id: " + updating.getQuanLyId());
        }
        Optional<Kho> findingKho = khoRepository.findByMaKho(updating.getMaKho());
        if (findingKho.isPresent() && !findingKho.get().getId().equals(updating.getId())) {
            throw new CommonException("Mã kho đã tồn tại");
        }
        Kho kho = null;
        if (findingKho.isPresent()) {
            kho = findingKho.get();
        } else {
            Optional<Kho> findingUpdatingKho = getOne(updating.getId());
            if (findingUpdatingKho.isEmpty()){
                throw new CommonException("Không tìm thấy kho id: " + updating.getId());
            }
            kho = findingUpdatingKho.get();
        }
        kho.setMaKho(updating.getMaKho());
        kho.setTenKho(updating.getTenKho());
        kho.setDiaChi(updating.getDiaChi());
        kho.setQuanLy(findingQuanLy.get());
        kho.setTrangThai(updating.getTrangThai());
        kho = update(updating.getId(), kho);

        return ResponseEntity.ok(
                ResponseData.<KhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(khoMapper.toDto(kho))
                        .message("Success")
                        .build()
        );
    }

}
