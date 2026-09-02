package io.github.carlosegzm.frota_core.dto.request;

import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import jakarta.validation.constraints.NotNull;

public record VehicleStatusRequest(
        @NotNull(message = "Status is required")
        VehicleStatus status
) {
}
