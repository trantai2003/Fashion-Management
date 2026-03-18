package com.dev.backend.services.impl.multitable;

import com.dev.backend.dto.response.AdminDashboardResponse;
import com.dev.backend.repository.*;
import com.dev.backend.services.multitable.AdminDashboardService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final NguoiDungRepository nguoiDungRepository;
    private final DonBanHangRepository donBanHangRepository;
    private final DonMuaHangRepository donMuaHangRepository;
    private final TonKhoTheoLoRepository tonKhoTheoLoRepository;
    private final SanPhamQuanAoRepository sanPhamQuanAoRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final PhieuNhapKhoRepository phieuNhapKhoRepository;
    private final PhieuXuatKhoRepository phieuXuatKhoRepository;

    public AdminDashboardServiceImpl(
            NguoiDungRepository nguoiDungRepository,
            DonBanHangRepository donBanHangRepository,
            DonMuaHangRepository donMuaHangRepository,
            TonKhoTheoLoRepository tonKhoTheoLoRepository,
            SanPhamQuanAoRepository sanPhamRepository, SanPhamQuanAoRepository sanPhamQuanAoRepository,
            NhaCungCapRepository nhaCungCapRepository,
            PhieuNhapKhoRepository phieuNhapKhoRepository,
            PhieuXuatKhoRepository phieuXuatKhoRepository
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.donBanHangRepository = donBanHangRepository;
        this.donMuaHangRepository = donMuaHangRepository;
        this.tonKhoTheoLoRepository = tonKhoTheoLoRepository;
        this.sanPhamQuanAoRepository = sanPhamQuanAoRepository;
        this.nhaCungCapRepository = nhaCungCapRepository;
        this.phieuNhapKhoRepository = phieuNhapKhoRepository;
        this.phieuXuatKhoRepository = phieuXuatKhoRepository;
    }

    @Override
    public AdminDashboardResponse getDashboard() {

        /* ================= REVENUE CHART ================= */

        Instant fromDate = LocalDate.now()
                .minusDays(6)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        Map<String, Long> revenueMap =
                donBanHangRepository.revenueFromDate(fromDate)
                        .stream()
                        .collect(Collectors.toMap(
                                row -> row[0].toString(),
                                row -> ((Number) row[1]).longValue()
                        ));

        List<AdminDashboardResponse.RevenueChartItem> chart = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {

            LocalDate date = LocalDate.now().minusDays(i);
            String key = date.toString();

            chart.add(
                    AdminDashboardResponse.RevenueChartItem.builder()
                            .date(key)
                            .value(revenueMap.getOrDefault(key, 0L))
                            .build()
            );
        }

        /* ================= BUILD RESPONSE ================= */

        return AdminDashboardResponse.builder()

                /* USER */

                .totalUsers(nguoiDungRepository.count())
                .newUsersToday(nguoiDungRepository.countNewUsersToday())
                .bannedUsers(nguoiDungRepository.countBannedUsers())

                /* SALES */

                .totalOrdersToday(donBanHangRepository.countOrdersToday())
                .revenueToday(donBanHangRepository.sumRevenueToday())

                /* PURCHASE */

                .pendingPurchaseOrders(
                        donMuaHangRepository.countPendingPurchaseOrders().intValue()
                )

                .purchaseToday(
                        donMuaHangRepository.countPurchaseToday().intValue()
                )

                /* WAREHOUSE */

                .lowStockCount(
                        tonKhoTheoLoRepository.countLowStockWarnings().intValue()
                )

                .pendingImports(
                        phieuNhapKhoRepository.countPendingImports().intValue()
                )

                .pendingExports(
                        phieuXuatKhoRepository.countPendingExports().intValue()
                )

                .importToday(
                        phieuNhapKhoRepository.countImportToday().intValue()
                )

                .exportToday(
                        phieuXuatKhoRepository.countExportToday().intValue()
                )

                /* SALES ORDER */

                .pendingSaleOrders(
                        donBanHangRepository.countPendingSaleOrders().intValue()
                )

                /* PRODUCT */

                .totalProducts(
                        sanPhamQuanAoRepository.count()
                )

                /* SUPPLIER */

                .totalSuppliers(
                        nhaCungCapRepository.count()
                )

                /* CHART */

                .revenueLast7Days(chart)

                .build();
    }
}