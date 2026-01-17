package com.dev.backend.services.impl.utils;

import com.dev.backend.constant.ConstantVariables;
import com.dev.backend.services.JwtService;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.Set;
import java.util.StringJoiner;

@Service
public class JwtServiceImpl implements JwtService {
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
}

