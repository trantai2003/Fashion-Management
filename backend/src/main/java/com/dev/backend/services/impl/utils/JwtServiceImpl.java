package com.dev.backend.services.impl.utils;

import com.dev.backend.constant.variables.ConstantVariables;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.dto.response.entities.PhanQuyenNguoiDungKhoDto;
import com.dev.backend.services.JwtService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.StringJoiner;

@Service
public class JwtServiceImpl implements JwtService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String buildScope(Set<String> roles) {
        StringJoiner scopeJoiner = new StringJoiner(" ");
        roles.forEach(scopeJoiner::add);
        return scopeJoiner.toString();
    }

    @Override
    public String generateToken(String id, String email, Set<String> roles, String userAgent) {
        String scope = buildScope(roles);
        JWSHeader jwtHeader = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("BlogDemo")
                .issueTime(new Date())
                .expirationTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
                .claim("id", id)
                .claim("scope", scope)
                .claim("userAgent", userAgent)
                .build();
        Payload jwtPayload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwtHeader, jwtPayload);
        try {
            jwsObject.sign(new MACSigner(ConstantVariables.SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String generateTokenWithPermissions(
            Integer id,
            String tenDangNhap,
            String hoTen,
            String email,
            String soDienThoai,
            Set<String> vaiTros,
            Integer trangThai,
            Instant ngayTao,
            Instant ngayCapNhat,
            List<PhanQuyenNguoiDungKhoDto> phanQuyenNguoiDungKhos,
            String userAgent) {
        try {
            JWSHeader jwtHeader = new JWSHeader(JWSAlgorithm.HS256);


            String phanQuyenNguoiDungKhosJson = objectMapper.writeValueAsString(phanQuyenNguoiDungKhos);


            JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                    .subject(email)
                    .issuer("FashionSystem")
                    .issueTime(new Date())
                    .expirationTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
                    .claim("id", id)
                    .claim("tenDangNhap", tenDangNhap)
                    .claim("hoTen", hoTen)
                    .claim("soDienThoai", soDienThoai)
                    .claim("trangThai", trangThai)
                    .claim("scope", buildScope(vaiTros))
                    .claim("warehousePermissions", phanQuyenNguoiDungKhosJson)
                    .claim("userAgent", userAgent)
                    .build();

            Payload jwtPayload = new Payload(jwtClaimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(jwtHeader, jwtPayload);
            jwsObject.sign(new MACSigner(ConstantVariables.SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException | JsonProcessingException e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    @Override
    public Integer getUserId(String token) {
        return (Integer) getClaimsFromToken(token).getClaims().get("id");
    }

    @Override
    public String getKeycloakUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            return claims.getSubject();
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }

    @Override
    public JWTClaimsSet getClaimsFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet();
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getTokenFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }

    @Override
    public NguoiDungAuthInfo getNguoiDungAuthInfoFromToken(String token) {
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            JWSVerifier verifier = new MACVerifier(ConstantVariables.SIGNER_KEY.getBytes());

            if (!jwsObject.verify(verifier)) {
                throw new RuntimeException("Invalid token signature");
            }

            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());

            String scope = claims.getStringClaim("scope");
            String warehousePermissionsJson = claims.getStringClaim("warehousePermissions");

            List<PhanQuyenNguoiDungKhoDto> phanQuyenNguoiDungKhoDtos =
                    objectMapper.readValue(
                            warehousePermissionsJson,
                            new TypeReference<List<PhanQuyenNguoiDungKhoDto>>() {
                            }
                    );

            return NguoiDungAuthInfo.builder()
                    .id(claims.getIntegerClaim("id"))
                    .email(claims.getSubject())
                    .vaiTro(Set.of(scope.split(" ")))
                    .hoTen(claims.getStringClaim("hoTen"))
                    .soDienThoai(claims.getStringClaim("soDienThoai"))
                    .trangThai(claims.getIntegerClaim("trangThai"))
                    .phanQuyenNguoiDungKhos(phanQuyenNguoiDungKhoDtos)
                    .build();
        } catch (JOSEException | ParseException | JsonProcessingException e) {
            throw new RuntimeException("Error parsing token " + e.getMessage(), e);
        }
    }

    @Override
    public boolean hasAnyRole(NguoiDungAuthInfo nguoiDungAuthInfo, String... roles) {

        // kiểm tra vai trò người dùng
        for (String role : roles) {
            for (String vaiTro : nguoiDungAuthInfo.getVaiTro()) {
                if (vaiTro.equals(role)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public boolean hasAllRoles(NguoiDungAuthInfo nguoiDungAuthInfo, String... roles) {

        for (String role : roles) {
            if (!nguoiDungAuthInfo.getVaiTro().contains(role)) {
                return false;
            }
        }
        return false;
    }

    @Override
    public boolean inWorkspace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo) {

        for (PhanQuyenNguoiDungKhoDto phanQuyenNguoiDungKhoDto : nguoiDungAuthInfo.getPhanQuyenNguoiDungKhos()) {
            if (phanQuyenNguoiDungKhoDto.getKho().getId().equals(workspaceId)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean hasAnyPermissionInWorkSpace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo, String... permissions) {
        for (String permission : permissions) {
            for (PhanQuyenNguoiDungKhoDto phanQuyenNguoiDungKhoDto : nguoiDungAuthInfo.getPhanQuyenNguoiDungKhos()) {
                if (phanQuyenNguoiDungKhoDto.getKho().getId().equals(workspaceId)) {
                    return phanQuyenNguoiDungKhoDto.getChiTietQuyenKhos().stream().anyMatch(
                            chiTietQuyenKho ->
                                    chiTietQuyenKho.getQuyenHan().getMaQuyen().equals(permission));
                }
            }
        }
        return false;
    }

    @Override
    public boolean hasAllPermissionsInWorkSpace(Integer workspaceId, NguoiDungAuthInfo nguoiDungAuthInfo, String... permissions) {
        for (String permission : permissions) {
            for (PhanQuyenNguoiDungKhoDto phanQuyenNguoiDungKhoDto : nguoiDungAuthInfo.getPhanQuyenNguoiDungKhos()) {
                if (phanQuyenNguoiDungKhoDto.getKho().getId().equals(workspaceId)) {
                    return phanQuyenNguoiDungKhoDto.getChiTietQuyenKhos().stream().allMatch(
                            chiTietQuyenKho ->
                                    chiTietQuyenKho.getQuyenHan().getMaQuyen().equals(permission));
                }
            }
        }
        return false;
    }
}

