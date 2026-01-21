package com.dev.backend.services.multitable;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ThongKeHeThongService {

    ResponseEntity<ResponseData<List<TonKhoChiTietDTO>>> findTonKhoChiTietByKho(Integer khoId);
}
