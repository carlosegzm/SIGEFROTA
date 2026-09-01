package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.request.VehicleRequest;
import io.github.carlosegzm.frota_core.dto.response.VehicleResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class VehicleMapper {

    public static Vehicle toEntity (VehicleRequest request) {
        return Vehicle.builder()
                .plate(request.plate())
                .model(request.model())
                .brand(request.brand())
                .year(request.year())
                .currentKm(request.currentKm())
                .build();
    }

    public static VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .plate(vehicle.getPlate())
                .model(vehicle.getModel())
                .brand(vehicle.getBrand())
                .year(vehicle.getYear())
                .currentKm(vehicle.getCurrentKm())
                .status(vehicle.getStatus())
                .build();
    }



}
