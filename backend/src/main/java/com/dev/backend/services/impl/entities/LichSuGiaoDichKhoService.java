package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.response.entities.LichSuGiaoDichKhoDto;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.LichSuGiaoDichKho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.LichSuGiaoDichKhoMapper;
import com.dev.backend.repository.LichSuGiaoDichKhoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichSuGiaoDichKhoService {

    private final LichSuGiaoDichKhoRepository repository;
    private final LichSuGiaoDichKhoMapper mapper;

    /**
     * Lấy danh sách lịch sử giao dịch theo phân quyền:
     *  - quan_tri_vien  → xem tất cả
     *  - quan_ly_kho    → chỉ xem kho mình phụ trách (kho.quanLy = currentUser)
     *  - nhan_vien_kho  → chỉ xem giao dịch mình thực hiện
     */
    @Transactional(readOnly = true)
    public List<LichSuGiaoDichKhoDto> getAll() {
        // Dùng đúng pattern của KhoController
        NguoiDungAuthInfo currentUser = SecurityContextHolder.getUser();

        boolean isAdmin   = currentUser.getVaiTro().contains(IRoleType.quan_tri_vien);
        boolean isQuanLy  = currentUser.getVaiTro().contains(IRoleType.quan_ly_kho);
        boolean isNhanVien = currentUser.getVaiTro().contains(IRoleType.nhan_vien_kho);

        List<LichSuGiaoDichKho> result;

        if (isAdmin) {
            // Admin xem toàn bộ
            result = repository.findAllWithDetails();

        } else if (isQuanLy) {
            // Quản lý: xem lịch sử các kho mình phụ trách
            result = repository.findAllByQuanLyId(currentUser.getId());

        } else if (isNhanVien) {
            // Nhân viên: xem lịch sử giao dịch mình thực hiện
            result = repository.findAllByNhanVienId(currentUser.getId());

        } else {
            throw new CommonException("Không có quyền truy cập");
        }

        return result.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LichSuGiaoDichKhoDto getChiTiet(Integer id) {
        LichSuGiaoDichKho entity = repository.findByIdWithDetails(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy lịch sử ID: " + id));
        return mapper.toDto(entity);
    }

    @Transactional
    public LichSuGiaoDichKho create(LichSuGiaoDichKho entity) {
        return repository.save(entity);
    }
}