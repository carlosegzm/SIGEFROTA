package io.github.carlosegzm.frota_core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record VehicleRequest(

        @NotBlank(message = "Plate is required")
        @Pattern(
                regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$",
                message = "Invalid plate format (accepts ABC1234 or ABC1D23)"
        )
        String plate,

        @NotBlank(message = "Model is required")
        String model,

        @NotBlank(message = "Brand is required")
        String brand,

        @NotNull(message = "Year is required")
        @Min(value = 1900, message = "Year must be greater than 1900")
        Integer year,

        @NotNull(message = "Current KM is required")
        @Min(value = 0, message = "Current KM cannot be negative")
        Integer currentKm
) {
}
