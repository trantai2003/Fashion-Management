package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardResponse implements Serializable {

    // ===== USER =====
    Long totalUsers;
    Long newUsersToday;
    Long bannedUsers;

    // ===== ORDER / REVENUE =====
    Long totalOrdersToday;
    Long revenueToday;

    // ===== CHART =====
    List<RevenueChartItem> revenueLast7Days;

    // ===== QUICK ALERTS =====
    Integer lowStockCount;           // Tồn kho thấp
    Integer pendingPurchaseOrders;   // Đơn mua chờ duyệt
    Integer pendingSaleOrders;       // Đơn bán chờ duyệt

    /* ================== SUB DTO ================== */

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RevenueChartItem implements Serializable {
        String date;   // yyyy-MM-dd
        Long value;    // doanh thu
    }
}