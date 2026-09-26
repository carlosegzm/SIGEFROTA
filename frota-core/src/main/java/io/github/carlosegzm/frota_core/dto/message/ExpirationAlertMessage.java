package io.github.carlosegzm.frota_core.dto.message;

import io.github.carlosegzm.frota_core.domain.enums.AlertType;

import java.time.LocalDate;
import java.util.UUID;

public record ExpirationAlertMessage(
        UUID vehicleId,
        String plate,
        AlertType alertType,
        String description,
        LocalDate dueDate
) {
}
