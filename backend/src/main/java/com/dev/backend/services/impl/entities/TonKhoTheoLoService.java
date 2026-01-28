package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.entities.TonKhoTheoLo;
import com.dev.backend.repository.TonKhoTheoLoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TonKhoTheoLoService extends BaseServiceImpl<TonKhoTheoLo, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public TonKhoTheoLoService(TonKhoTheoLoRepository repository) {
        super(repository);
    }

    public TonKhoTheoLoRepository tonKhoTheoLoRepository = (TonKhoTheoLoRepository) getRepository();

    public List<TonKhoChiTietDTO> findTonKhoChiTietByKho(Integer khoId){
        return tonKhoTheoLoRepository.findTonKhoChiTietByKho(khoId);
    }
}
