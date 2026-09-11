package io.github.carlosegzm.frota_core.dto.response;

import io.github.carlosegzm.frota_core.domain.enums.MaintenanceType;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record MaintenanceResponse(
        UUID id,
        UUID vehicleId,
        MaintenanceType type,
        Integer registeredKm,
        LocalDate performedAt,
        Integer nextDueKm,
        LocalDate nextDueDate
) {
}
