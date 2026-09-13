package io.github.carlosegzm.frota_core.dto.request;

import io.github.carlosegzm.frota_core.domain.enums.DocumentType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;
import java.util.UUID;

public record DocumentRequest(

        @NotNull(message = "Vehicle ID is required")
        UUID vehicleId,

        @NotNull(message = "Document type is required")
        DocumentType type,

        @NotNull(message = "Issue date is required")
        @PastOrPresent(message = "Issue date cannot be in the future")
        LocalDate issuedAt,

        @NotNull(message = "Expiration date is required")
        @Future(message = "Expiration date must be in the future")
        LocalDate expiresAt
) {
}
