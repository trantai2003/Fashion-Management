package com.dev.backend.config;

import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;

public class SecurityContextHolder {
    private static final ThreadLocal<NguoiDungAuthInfo> userContext = new ThreadLocal<>();
    private static final ThreadLocal<Integer> khoIdContext = new ThreadLocal<>();
    private static final ThreadLocal<String> pathContext = new ThreadLocal<>();

    public static void setUser(NguoiDungAuthInfo user) {
        userContext.set(user);
    }
    public static void setKhoId(Integer khoId) {
        khoIdContext.set(khoId);
    }
    public static void setPath(String path) {
        pathContext.set(path);
    }

    public static NguoiDungAuthInfo getUser() {
        return userContext.get();
    }
    public static Integer getKhoId() {
        return khoIdContext.get();
    }
    public static String getPath() {
        return pathContext.get();
    }

    public static void clear() {
        userContext.remove();
        khoIdContext.remove();
        pathContext.remove();
    }
}
