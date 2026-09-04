package io.github.carlosegzm.frota_core.dto.response;

import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record DriverResponse(
        UUID id,
        String name,
        String licenseNumber,
        String licenseCategory,
        LocalDate licenseExpiration,
        String phone
) {
}
