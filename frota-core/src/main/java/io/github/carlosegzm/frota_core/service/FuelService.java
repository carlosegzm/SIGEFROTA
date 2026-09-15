package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Fuel;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import io.github.carlosegzm.frota_core.mapper.FuelMapper;
import io.github.carlosegzm.frota_core.repository.FuelRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class FuelService {

    private final FuelRepository fuelRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public FuelResponse create(FuelRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.vehicleId()));

        Optional<Fuel> previousFuel = fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId());

        BigDecimal consumption = null;

        if (previousFuel.isPresent()) {
            int odometerDiff = request.odometerKm() - previousFuel.get().getOdometerKm();

            if (odometerDiff <= 0) {
                throw new IllegalArgumentException("Current odometer must be greater than the previous odometer");
            }

            consumption = BigDecimal.valueOf(odometerDiff).divide(request.liters(), 2, RoundingMode.HALF_UP);
        }

        Fuel fuel = FuelMapper.toEntity(request);
        fuel.setVehicle(vehicle);
        fuel.setConsumptionKmL(consumption);
        Fuel savedFuel = fuelRepository.save(fuel);
        return FuelMapper.toResponse(savedFuel);
    }

    public List<FuelResponse> listAll() {
        List<Fuel> allFuels = fuelRepository.findAll();
        return allFuels.stream()
                .map(FuelMapper::toResponse)
                .toList();
    }

    public FuelResponse findById(UUID id) {
        Fuel fuel = fuelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel not found with ID: " + id));

        return FuelMapper.toResponse(fuel);
    }


}
