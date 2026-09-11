package io.github.carlosegzm.frota_core.dto.request;

import io.github.carlosegzm.frota_core.domain.enums.MaintenanceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceRequest(
        @NotNull(message = "Vehicle ID is required")
        UUID vehicleId,

        @NotNull(message = "Maintenance type is required")
        MaintenanceType type,

        @NotNull(message = "Registered kilometers is required")
        @PositiveOrZero(message = "Registered kilometers must be zero or a positive number")
        Integer registeredKm,

        @NotNull(message = "Performance date is required")
        @PastOrPresent(message = "Performance date cannot be in the future")
        LocalDate performedAt
) {
}
