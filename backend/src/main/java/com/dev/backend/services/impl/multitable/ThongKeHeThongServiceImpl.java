package com.dev.backend.services.impl.multitable;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.services.impl.entities.TonKhoTheoLoService;
import com.dev.backend.services.multitable.ThongKeHeThongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ThongKeHeThongServiceImpl implements ThongKeHeThongService {

    @Autowired
    private TonKhoTheoLoService tonKhoTheoLoService;


    @Override
    public ResponseEntity<ResponseData<List<TonKhoChiTietDTO>>> findTonKhoChiTietByKho(Integer khoId) {
        return ResponseEntity.ok(
                ResponseData.<List<TonKhoChiTietDTO>>builder()
                        .status(HttpStatus.OK.value())
                        .data(tonKhoTheoLoService.findTonKhoChiTietByKho(khoId))
                        .message("Success")
                        .build()
        );
    }
}
