package com.dev.backend.config;

import com.dev.backend.customizeanotation.RequireAuth;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;

@Component
public class RequireAuthOperationCustomizer implements OperationCustomizer {

    @Override
    public Operation customize(Operation operation, HandlerMethod handlerMethod) {
        RequireAuth requireAuth = handlerMethod.getMethodAnnotation(RequireAuth.class);

        if (requireAuth != null) {
            // Thêm Authorization requirement
            operation.addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));

            // Xây dựng description
            StringBuilder description = new StringBuilder();

            if (operation.getDescription() != null && !operation.getDescription().isEmpty()) {
                description.append(operation.getDescription()).append("\n\n");
            }

            description.append("---\n\n");
            description.append("### 🔐 Authorization Requirements\n\n");

            // Tạo bảng thông tin
            description.append("| Requirement | Details | Logic |\n");
            description.append("|-------------|---------|-------|\n");

            // Roles
            String[] roles = requireAuth.roles();
            if (roles.length > 0) {
                description.append("| **Roles** | ");
                description.append(formatArray(roles));
                description.append(" | `").append(requireAuth.rolesLogic()).append("` |\n");
            }

            // Permissions
            String[] permissions = requireAuth.permissions();
            if (permissions.length > 0) {
                description.append("| **Permissions** | ");
                description.append(formatArray(permissions));
                description.append(" | `").append(requireAuth.permissionsLogic()).append("` |\n");
            }

            // Warehouse
            if (requireAuth.inWarehouse()) {
                description.append("| **Warehouse Context** | Required | - |\n");

                Parameter khoIdParam = new Parameter()
                        .in("header")
                        .name("kho_id")
                        .description("ID của kho (bắt buộc khi inWarehouse = true)")
                        .required(true)
                        .schema(new StringSchema())
                        .example("1");

                operation.addParametersItem(khoIdParam);
            }

            description.append("\n");

            // Thêm note
            if (roles.length > 0 || permissions.length > 0) {
                description.append("> **Note:** ");
                if (roles.length > 0 && permissions.length > 0) {
                    description.append("User must satisfy BOTH role and permission requirements.");
                } else if (roles.length > 0) {
                    description.append("User must have at least one of the required roles");
                    if (requireAuth.rolesLogic() == RequireAuth.LogicType.AND) {
                        description.append(" (ALL roles required)");
                    }
                    description.append(".");
                } else {
                    description.append("User must have at least one of the required permissions");
                    if (requireAuth.permissionsLogic() == RequireAuth.LogicType.AND) {
                        description.append(" (ALL permissions required)");
                    }
                    description.append(".");
                }
                description.append("\n");
            }

            operation.setDescription(description.toString());
        }

        return operation;
    }

    private String formatArray(String[] items) {
        if (items.length == 0) return "-";
        if (items.length == 1) return "`" + items[0] + "`";

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < items.length; i++) {
            sb.append("`").append(items[i]).append("`");
            if (i < items.length - 1) {
                sb.append(", ");
            }
        }
        return sb.toString();
    }
}