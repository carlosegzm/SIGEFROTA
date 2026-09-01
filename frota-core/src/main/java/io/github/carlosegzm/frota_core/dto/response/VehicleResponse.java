package io.github.carlosegzm.frota_core.dto.response;

import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import lombok.Builder;

import java.util.UUID;

@Builder
public record VehicleResponse(
        UUID id,
        String plate,
        String model,
        String brand,
        Integer year,
        Integer currentKm,
        VehicleStatus status
) {
}
