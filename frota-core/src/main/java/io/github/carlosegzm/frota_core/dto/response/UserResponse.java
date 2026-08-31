package io.github.carlosegzm.frota_core.dto.response;

import io.github.carlosegzm.frota_core.domain.enums.UserRole;
import lombok.Builder;

import java.util.UUID;

@Builder
public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role
) {
}
