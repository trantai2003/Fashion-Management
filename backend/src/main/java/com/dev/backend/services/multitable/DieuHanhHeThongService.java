package com.dev.backend.services.multitable;

import com.dev.backend.dto.request.PhanQuyenNguoiDungKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import org.springframework.http.ResponseEntity;

public interface DieuHanhHeThongService {
    ResponseEntity<ResponseData<String>> ganQuyenNhanVienKho(PhanQuyenNguoiDungKhoCreating pqndkCreating);
}
