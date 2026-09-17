package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.Fuel;
import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FuelMapper {

    public static Fuel toEntity(FuelRequest request) {
        return Fuel.builder()
                .refueledAt(request.refueledAt())
                .liters(request.liters())
                .totalCost(request.totalCost())
                .odometerKm(request.odometerKm())
                .build();
    }

    public static FuelResponse toResponse(Fuel fuel) {
        return FuelResponse.builder()
                .id(fuel.getId())
                .vehicleId(fuel.getVehicle().getId())
                .refueledAt(fuel.getRefueledAt())
                .liters(fuel.getLiters())
                .totalCost(fuel.getTotalCost())
                .odometerKm(fuel.getOdometerKm())
                .consumptionKmL(fuel.getConsumptionKmL())
                .anomalousConsumption(fuel.getAnomalousConsumption())
                .build();
    }


}
