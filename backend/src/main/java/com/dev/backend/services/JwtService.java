package com.dev.backend.services;

import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.dto.response.entities.PhanQuyenNguoiDungKhoDto;
import com.nimbusds.jwt.JWTClaimsSet;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public interface JwtService {

    String buildScope(Set<String> roles);

    @Deprecated
    String generateToken(String id, String email, Set<String> roles, String userAgent);

    String generateTokenWithPermissions(
            Integer id,
            String tenDangNhap,
            String hoTen,
            String email,
            String soDienThoai,
            Set<String> vaiTros,  // Role chính: quan_tri_vien, quan_ly_kho, nhan_vien_kho...
            Integer trangThai,
            Instant ngayTao,
            Instant ngayCapNhat,
            List<PhanQuyenNguoiDungKhoDto> phanQuyenNguoiDungKhos, // Quyền theo từng kho
            String userAgent
    );

    Integer getUserId(String token);

    String getKeycloakUserIdFromToken(String token);

    String getCurrentUserId();

    JWTClaimsSet getClaimsFromToken(String token);

    String getTokenFromAuthHeader(String authHeader);


    // Kiểm tra quyền người dùng
    NguoiDungAuthInfo getNguoiDungAuthInfoFromToken(String token);
    public boolean hasAnyRole(NguoiDungAuthInfo nguoiDungAuthInfo, String... roles);
    public boolean hasAllRoles(NguoiDungAuthInfo nguoiDungAuthInfo, String... roles);
    public boolean inWorkspace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo);
    public boolean hasAnyPermissionInWorkSpace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo, String... permissions);
    public boolean hasAllPermissionsInWorkSpace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo, String... permissions);
}
