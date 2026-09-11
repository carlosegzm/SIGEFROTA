package io.github.carlosegzm.frota_core.dto.response;

import io.github.carlosegzm.frota_core.domain.enums.DocumentType;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record DocumentResponse(
        UUID id,
        UUID vehicleId,
        DocumentType type,
        LocalDate issuedAt,
        LocalDate expiresAt
) {
}
