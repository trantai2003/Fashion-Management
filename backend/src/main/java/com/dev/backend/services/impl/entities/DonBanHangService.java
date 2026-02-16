package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.FilterOperation;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.FilterCriteria;
import com.dev.backend.dto.response.customize.DonBanHangDetailResponse;
import com.dev.backend.dto.response.customize.PhieuXuatKhoSummaryDto;
import com.dev.backend.dto.response.entities.ChiTietDonBanHangDto;
import com.dev.backend.dto.response.entities.DonBanHangDto;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.DonBanHang;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.mapper.ChiTietDonBanHangMapper;
import com.dev.backend.mapper.DonBanHangMapper;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.repository.DonBanHangRepository;
import com.dev.backend.repository.PhieuXuatKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class DonBanHangService extends BaseServiceImpl<DonBanHang, Integer> {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private DonBanHangMapper donBanHangMapper;

    @Autowired
    private ChiTietDonBanHangMapper chiTietDonBanHangMapper;

    @Autowired
    private PhieuXuatKhoRepository phieuXuatKhoRepository;

    @Autowired
    private PhieuXuatKhoMapper phieuXuatKhoMapper;


    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public DonBanHangService(DonBanHangRepository repository) {
        super(repository);
    }

    private final DonBanHangRepository donBanHangRepository =
            (DonBanHangRepository) getRepository();

    @Override
    @Transactional(readOnly = true)
    public Page<DonBanHang> filter(BaseFilterRequest request) {

        NguoiDungAuthInfo currentUser = SecurityContextHolder.getUser();
        boolean isAdmin = currentUser.getVaiTro()
                .contains(IRoleType.quan_tri_vien.toString());
        if (!isAdmin) {
            List<FilterCriteria> filters =
                    request.getFilters() == null
                            ? new ArrayList<>()
                            : new ArrayList<>(request.getFilters());
            filters.add(
                    FilterCriteria.builder()
                            .fieldName("nguoiTao.id")
                            .operation(FilterOperation.EQUALS)
                            .value(currentUser.getId())
                            .logicType(FilterLogicType.AND)
                            .build()
            );
            request.setFilters(filters);
        }
        return super.filter(request);
    }

    @Transactional(readOnly = true)
    public DonBanHangDetailResponse getDetail(Integer id) {
        DonBanHang don = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn bán"));

        // Map đơn bán
        DonBanHangDto donDto = donBanHangMapper.toDto(don);

        // Map chi tiết đơn
        List<ChiTietDonBanHangDto> chiTietDtos =
                don.getChiTietDonBanHangs()
                        .stream()
                        .map(chiTietDonBanHangMapper::toDto)
                        .toList();

        // Lấy danh sách phiếu xuất kho liên quan
        List<PhieuXuatKho> phieuList =
                phieuXuatKhoRepository.findByDonBanHangId(id);

        List<PhieuXuatKhoSummaryDto> phieuDtos =
                phieuList.stream()
                        .map(phieuXuatKhoMapper::toSummaryDto)
                        .toList();

        return DonBanHangDetailResponse.builder()
                .donBanHang(donDto)
                .chiTiet(chiTietDtos)
                .phieuXuatKhoList(phieuDtos)
                .build();
    }

    @Transactional
    public void sendToWarehouse(Integer id) {
        DonBanHang don = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn bán"));

        if (don.getTrangThai() == null || don.getTrangThai() != 0) {
            throw new RuntimeException("Chỉ đơn ở trạng thái Nháp mới được gửi kho");
        }
        don.setTrangThai(1); // Chờ xuất kho
        repository.save(don);
    }

    @Transactional
    public void cancel(Integer id) {

        DonBanHang don = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn bán"));

        if (don.getTrangThai() == 3) {
            throw new RuntimeException("Đơn đã hoàn thành, không thể hủy");
        }

        // Kiểm tra có phiếu xuất đã xuất chưa
        boolean existsCompletedPX =
                phieuXuatKhoRepository
                        .existsByDonBanHangIdAndTrangThai(id, 3);

        if (existsCompletedPX) {
            throw new RuntimeException("Đơn đã có phiếu xuất hoàn thành, không thể hủy");
        }

        don.setTrangThai(4); // Đã hủy
        repository.save(don);
    }
}
