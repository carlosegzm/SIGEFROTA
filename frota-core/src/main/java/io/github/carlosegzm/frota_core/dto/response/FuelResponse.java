package io.github.carlosegzm.frota_core.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record FuelResponse(
        UUID id,
        UUID vehicleId,
        LocalDate refueledAt,
        BigDecimal liters,
        BigDecimal totalCost,
        Integer odometerKm,
        BigDecimal consumptionKmL,
        Boolean anomalousConsumption
) {
}
