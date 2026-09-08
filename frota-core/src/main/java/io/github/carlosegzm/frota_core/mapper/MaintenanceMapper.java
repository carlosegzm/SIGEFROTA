package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.dto.request.MaintenanceRequest;
import io.github.carlosegzm.frota_core.dto.response.MaintenanceResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class MaintenanceMapper {

    public static Maintenance toEntity(MaintenanceRequest request) {
        return Maintenance.builder()
                .type(request.type())
                .registeredKm(request.registeredKm())
                .performedAt(request.performedAt())
                .build();
    }

    public static MaintenanceResponse toResponse(Maintenance maintenance) {
        return MaintenanceResponse.builder()
                .id(maintenance.getId())
                .vehicleId(maintenance.getVehicle().getId())
                .type(maintenance.getType())
                .registeredKm(maintenance.getRegisteredKm())
                .performedAt(maintenance.getPerformedAt())
                .nextDueKm(maintenance.getNextDueKm())
                .nextDueDate(maintenance.getNextDueDate())
                .build();
    }


}
