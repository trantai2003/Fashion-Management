package com.dev.backend.config;

import com.dev.backend.constant.enums.RoleType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.services.JwtService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestHeader;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

@Aspect
@Component
public class AuthorizationAspect {

    @Autowired
    private JwtService jwtService;


    @Around("@annotation(requireAuth)")
    public Object checkAuthorization(ProceedingJoinPoint joinPoint, RequireAuth requireAuth) throws Throwable {
        String authHeader = getAuthHeader(joinPoint);
        String token = jwtService.getTokenFromAuthHeader(authHeader);

        String[] requiredRoles = requireAuth.roles();

        for (String role : requiredRoles) {
            if(role.equals(IRoleType.all)){
                return joinPoint.proceed();
            }
        }

        NguoiDungAuthInfo nguoiDungAuthInfo = jwtService.getNguoiDungAuthInfoFromToken(token);

        // Quản trị viên có tất cả các quyền
        if (nguoiDungAuthInfo.getVaiTro().contains(RoleType.quan_tri_vien.toString())) {
            return joinPoint.proceed();
        }
        // Nếu không là quản trị viên sẽ check quyền và quyền hạn
        if (requiredRoles.length > 0) {
            boolean hasAccess = requireAuth.rolesLogic() == RequireAuth.LogicType.OR
                    ? jwtService.hasAnyRole(nguoiDungAuthInfo, requiredRoles)  // Có ít nhất 1 role
                    : jwtService.hasAllRoles(nguoiDungAuthInfo, requiredRoles); // Có tất cả roles

            if (!hasAccess) {
                throw new AccessDeniedException("Vai trò đủ");
            }
        }

        if (requireAuth.inWarehouse()) {
            if (requireAuth.permissions().length > 0) {
                Integer warehouseId = getWarehouseId(joinPoint);
                boolean hasAccess = requireAuth.permissionsLogic() == RequireAuth.LogicType.OR
                        ? jwtService.hasAnyPermissionInWorkSpace(warehouseId, nguoiDungAuthInfo, requireAuth.permissions()) // Có ít nhất 1 permission
                        : jwtService.hasAllPermissionsInWorkSpace(warehouseId, nguoiDungAuthInfo, requireAuth.permissions()); // Có tất cả permissions
                if (!hasAccess) {
                    throw new AccessDeniedException("Quyền hạn không đủ");
                }
            }
        }


        return joinPoint.proceed();
    }

    private String getAuthHeader(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].isAnnotationPresent(RequestHeader.class)) {
                RequestHeader header = parameters[i].getAnnotation(RequestHeader.class);
                if ("Authorization".equals(header.value())) {
                    return (String) args[i];
                }
            }
        }

        throw new AccessDeniedException("Không tìm thấy header Authorization");
    }

    public Integer getWarehouseId(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].isAnnotationPresent(RequestHeader.class)) {
                RequestHeader header = parameters[i].getAnnotation(RequestHeader.class);
                if ("kho_id".equals(header.value())) {
                    return (Integer) args[i];
                }
            }
        }
        throw new AccessDeniedException("Không tìm thấy header kho_id");
    }
}
