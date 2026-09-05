package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.Driver;
import io.github.carlosegzm.frota_core.dto.request.DriverRequest;
import io.github.carlosegzm.frota_core.dto.response.DriverResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class DriverMapper {

    public static Driver toEntity(DriverRequest request) {
        return Driver.builder()
                .name(request.name())
                .licenseNumber(request.licenseNumber())
                .licenseCategory(request.licenseCategory())
                .licenseExpiration(request.licenseExpiration())
                .phone(request.phone())
                .build();
    }

    public static DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .licenseNumber(driver.getLicenseNumber())
                .licenseCategory(driver.getLicenseCategory())
                .licenseExpiration(driver.getLicenseExpiration())
                .phone(driver.getPhone())
                .active(driver.isActive())
                .build();
    }


}
