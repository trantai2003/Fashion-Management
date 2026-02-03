package com.dev.backend.config;

import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    //Truoc khi vao 1 api nao thi chay qua day de lay context user
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String authHeader = request.getHeader("Authorization");
        String khoId = request.getHeader("kho_id");
        SecurityContextHolder.setPath(request.getRequestURI());
        if (authHeader != null) {
            String token = jwtService.getTokenFromAuthHeader(authHeader);
            NguoiDungAuthInfo nguoiDungAuthInfo = jwtService.getNguoiDungAuthInfoFromToken(token);
            SecurityContextHolder.setUser(nguoiDungAuthInfo);
        }
        if (khoId != null) {
            SecurityContextHolder.setKhoId(Integer.parseInt(khoId));
        }
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) {
        SecurityContextHolder.clear(); // Xóa sau khi xử lý xong
    }
}
