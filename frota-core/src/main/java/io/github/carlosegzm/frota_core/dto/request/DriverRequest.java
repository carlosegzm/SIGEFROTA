package io.github.carlosegzm.frota_core.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record DriverRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "License number is required")
        String licenseNumber,

        @NotBlank(message = "License category is required")
        @Pattern(regexp = "^[A-E](1)?$|^AB$", message = "Invalid license category. Allowed values: A, B, C, D, E, AB, etc.")
        String licenseCategory,

        @NotNull(message = "License expiration date is required")
        @FutureOrPresent(message = "License expiration date must be today or in the future")
        LocalDate licenseExpiration,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{4,5}-\\d{4}$", message = "Invalid phone number. Expected format: (XX) XXXXX-XXXX")
        String phone
) {
}
