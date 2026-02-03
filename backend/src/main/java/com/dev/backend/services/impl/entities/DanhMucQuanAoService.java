package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.DanhMucQuanAoCreating;
import com.dev.backend.dto.request.DanhMucQuanAoUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DanhMucQuanAoDto;
import com.dev.backend.entities.DanhMucQuanAo;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.DanhMucQuanAoMapper;
import com.dev.backend.repository.DanhMucQuanAoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DanhMucQuanAoService extends BaseServiceImpl<DanhMucQuanAo, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private DanhMucQuanAoMapper danhMucQuanAoMapper;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public DanhMucQuanAoService(DanhMucQuanAoRepository repository) {
        super(repository);
    }

    public final DanhMucQuanAoRepository danhMucQuanAoRepository = (DanhMucQuanAoRepository) getRepository();

    public List<DanhMucQuanAo> findAllDanhMucChaByTrangThai(Integer trangThai) {
        return danhMucQuanAoRepository.findAllDanhMucChaByTrangThai(trangThai);
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> create(DanhMucQuanAoCreating creating) {
        Optional<DanhMucQuanAo> findingDanhMucQuanAo = danhMucQuanAoRepository
                .findByMaDanhMuc(creating.getMaDanhMuc());
        if (findingDanhMucQuanAo.isPresent()) {
            throw new CommonException("Mã danh mục đã tồn tại");
        }

        DanhMucQuanAo danhMucCha = getOne(creating.getDanhMucChaId()).orElseThrow(
                () -> new CommonException("Danh mục cha không tồn tại id: " + creating.getDanhMucChaId())
        );

        DanhMucQuanAo danhMucQuanAo = new DanhMucQuanAo();
        danhMucQuanAo.setMaDanhMuc(creating.getMaDanhMuc());
        danhMucQuanAo.setTenDanhMuc(creating.getTenDanhMuc());
        danhMucQuanAo.setDanhMucCha(danhMucCha);
        danhMucQuanAo.setMoTa(creating.getMoTa());
        danhMucQuanAo.setTrangThai(creating.getTrangThai());
        create(danhMucQuanAo);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> update(DanhMucQuanAoUpdating updating) {

        DanhMucQuanAo danhMucQuanAo = getOne(updating.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy danh mục id: " + updating.getId())
        );

        DanhMucQuanAo danhMucCha = getOne(updating.getDanhMucChaId()).orElseThrow(
                () -> new CommonException("Danh mục cha không tồn tại id: " + updating.getDanhMucChaId())
        );

        if (danhMucCha.getTrangThai() == 0) {
            throw new CommonException("Danh mục cha đã bị xoá");
        }

        if (danhMucCha.getId().equals(updating.getId())) {
            throw new CommonException("Không thể gán danh mục cha cho chính danh mục đó");
        }

        danhMucQuanAo.setTenDanhMuc(updating.getTenDanhMuc());
        danhMucQuanAo.setMoTa(updating.getMoTa());
        danhMucQuanAo.setDanhMucCha(danhMucCha);
        update(updating.getId(), danhMucQuanAo);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()
        );
    }


}
