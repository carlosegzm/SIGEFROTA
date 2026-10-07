package io.github.carlosegzm.frota_core.dto.request;

import io.github.carlosegzm.frota_core.domain.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record UserRoleRequest(
        @NotNull(message = "Role is required")
        UserRole role
) {
}
