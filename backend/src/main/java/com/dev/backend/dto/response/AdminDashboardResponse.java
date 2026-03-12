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

    /* ================= USER ================= */

    Long totalUsers;
    Long newUsersToday;
    Long bannedUsers;

    /* ================= SALES ================= */

    Long totalOrdersToday;
    Long revenueToday;

    /* ================= PURCHASE ================= */

    Integer pendingPurchaseOrders;

    /* ================= WAREHOUSE ================= */

    Integer lowStockCount;
    Integer pendingExports;
    Integer pendingImports;
    Integer importToday;
    Integer exportToday;

    /* ================= SALES ORDER ================= */

    Integer pendingSaleOrders;

    /* ================= PRODUCT ================= */

    Long totalProducts;

    /* ================= SUPPLIER ================= */

    Long totalSuppliers;

    /* ================= CHART ================= */

    List<RevenueChartItem> revenueLast7Days;

    /* ================= SUB DTO ================= */

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