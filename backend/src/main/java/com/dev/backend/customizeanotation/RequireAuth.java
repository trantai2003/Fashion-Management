package com.dev.backend.customizeanotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAuth {
    String[] roles() default {}; // Các role được phép
    String[] permissions() default {}; // Các quyền được phép
    boolean inWarehouse() default false;

    LogicType rolesLogic() default LogicType.OR;
    LogicType permissionsLogic() default LogicType.OR;

    enum LogicType {
        AND, OR
    }
}
