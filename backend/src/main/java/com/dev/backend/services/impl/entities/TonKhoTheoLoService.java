package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.entities.SanPhamQuanAo;
import com.dev.backend.entities.TonKhoTheoLo;
import com.dev.backend.mapper.SanPhamQuanAoMapper;
import com.dev.backend.repository.TonKhoTheoLoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TonKhoTheoLoService extends BaseServiceImpl<TonKhoTheoLo, Integer> {
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private SanPhamQuanAoService sanPhamQuanAoService;
    @Autowired
    private SanPhamQuanAoMapper sanPhamQuanAoMapper;
    @Autowired
    private ChiTietPhieuXuatKhoService chiTietPhieuXuatKhoService;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public TonKhoTheoLoService(TonKhoTheoLoRepository repository) {
        super(repository);
    }

    public TonKhoTheoLoRepository tonKhoTheoLoRepository = (TonKhoTheoLoRepository) getRepository();

    public List<TonKhoChiTietDTO> findTonKhoChiTietByKho(Integer khoId) {
        return tonKhoTheoLoRepository.findTonKhoChiTietByKho(khoId);
    }

    public List<TonKhoChiTietDTO> findTonKhoChiTietByBienThe(Integer bienTheId) {
        return tonKhoTheoLoRepository.findTonKhoChiTietByBienThe(bienTheId);
    }

    public ResponseEntity<ResponseData<List<SanPhamQuanAoDto>>> sanPhamBanChay(Integer top) {
        List<Integer> topSanPhamIds = chiTietPhieuXuatKhoService.findTopSanPham(top);
        List<SanPhamQuanAo> topSanPhams = new ArrayList<>();

        for (Integer sanPhamId : topSanPhamIds) {
            sanPhamQuanAoService.getOne(sanPhamId).ifPresent(topSanPhams::add);
        }
        return ResponseEntity.ok(
                ResponseData.<List<SanPhamQuanAoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(sanPhamQuanAoMapper.toDtoList(topSanPhams))
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    public List<TonKhoChiTietDTO> findTonKhoChiTietByBienTheAndKho(Integer bienTheId, Integer khoId) {
        return tonKhoTheoLoRepository.findTonKhoChiTietByBienTheAndKho(bienTheId, khoId);
    }
}
