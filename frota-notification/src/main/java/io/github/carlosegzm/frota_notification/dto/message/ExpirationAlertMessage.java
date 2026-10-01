package io.github.carlosegzm.frota_notification.dto.message;

import java.time.LocalDate;
import java.util.UUID;

public record ExpirationAlertMessage(
        UUID vehicleId,
        String plate,
        String alertType,
        String description,
        LocalDate dueDate
) {
}
