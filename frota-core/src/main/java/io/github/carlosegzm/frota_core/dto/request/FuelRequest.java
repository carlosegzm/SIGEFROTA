package io.github.carlosegzm.frota_core.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FuelRequest(
        @NotNull(message = "Vehicle ID is required")
        UUID vehicleId,

        @NotNull(message = "Refueled date is required")
        @PastOrPresent(message = "Refueled date must be in the past or today")
        LocalDate refueledAt,

        @NotNull(message = "Liters amount is required")
        @Positive(message = "Liters must be greater than zero")
        BigDecimal liters,

        @NotNull(message = "Total cost is required")
        @Positive(message = "Total cost must be greater than zero")
        BigDecimal totalCost,

        @NotNull(message = "Odometer reading is required")
        @PositiveOrZero(message = "Odometer reading must be zero or a positive number")
        Integer odometerKm
) {
}
