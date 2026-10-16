package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Fuel;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.AlertType;
import io.github.carlosegzm.frota_core.dto.message.AuditEvent;
import io.github.carlosegzm.frota_core.dto.message.ExpirationAlertMessage;
import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import io.github.carlosegzm.frota_core.exception.custom.BusinessRuleException;
import io.github.carlosegzm.frota_core.exception.custom.ResourceNotFoundException;
import io.github.carlosegzm.frota_core.mapper.FuelMapper;
import io.github.carlosegzm.frota_core.messaging.AuditEventPublisher;
import io.github.carlosegzm.frota_core.messaging.ExpirationAlertPublisher;
import io.github.carlosegzm.frota_core.repository.FuelRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class FuelService {

    private final FuelRepository fuelRepository;
    private final VehicleRepository vehicleRepository;

    private static final int MINIMUM_HISTORY_FOR_ANOMALY_CHECK = 3;
    private static final BigDecimal ANOMALY_THRESHOLD_PERCENT = BigDecimal.valueOf(20);
    private final ExpirationAlertPublisher expirationAlertPublisher;
    private final AuditEventPublisher auditEventPublisher;

    @CacheEvict(value = "averageConsumption", key = "#request.vehicleId()")
    @Transactional
    public FuelResponse create(FuelRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.vehicleId()));

        Optional<Fuel> previousFuel = fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId());

        BigDecimal consumption = null;
        Boolean anomalousConsumption = null;

        if (previousFuel.isPresent()) {
            int odometerDiff = request.odometerKm() - previousFuel.get().getOdometerKm();

            if (odometerDiff <= 0) {
                throw new BusinessRuleException("Current odometer must be greater than the previous odometer");
            }

            consumption = BigDecimal.valueOf(odometerDiff).divide(request.liters(), 2, RoundingMode.HALF_UP);

            BigDecimal averageConsumption = getAverageConsumption(request.vehicleId());

            if (averageConsumption != null) {
                BigDecimal difference = consumption.subtract(averageConsumption).abs();
                BigDecimal deviationPercentage = difference
                        .divide(averageConsumption, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                anomalousConsumption = deviationPercentage.compareTo(ANOMALY_THRESHOLD_PERCENT) > 0;
            }
        }

        Fuel fuel = FuelMapper.toEntity(request);
        fuel.setVehicle(vehicle);
        fuel.setConsumptionKmL(consumption);
        fuel.setAnomalousConsumption(anomalousConsumption);
        Fuel savedFuel = fuelRepository.save(fuel);

        if (vehicle.getCurrentKm() == null || request.odometerKm() > vehicle.getCurrentKm()) {
            vehicle.setCurrentKm(request.odometerKm());
            vehicleRepository.save(vehicle);
        }

        if (Boolean.TRUE.equals(anomalousConsumption)) {
            ExpirationAlertMessage alertMessage = new ExpirationAlertMessage(
                    vehicle.getId(),
                    vehicle.getPlate(),
                    AlertType.FUEL_ANOMALY,
                    "Anomalous consumption detected: " + consumption + " km/L",
                    request.refueledAt()
            );
            expirationAlertPublisher.publish(alertMessage);
        }

        auditEventPublisher.publish(new AuditEvent(
                fuel.getId(),
                "FUEL",
                "CREATED",
                Instant.now()
        ));

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
                .orElseThrow(() -> new ResourceNotFoundException("Fuel not found with ID: " + id));

        return FuelMapper.toResponse(fuel);
    }

    @Cacheable(value = "averageConsumption", key = "#vehicleId")
    public BigDecimal getAverageConsumption(UUID vehicleId) {
        List<Fuel> lastRefuelings = fuelRepository.findTop10ByVehicleIdOrderByRefueledAtDesc(vehicleId);
        List<Fuel> refuelingsWithConsumption = lastRefuelings.stream()
                .filter(fuel -> fuel.getConsumptionKmL() != null)
                .toList();

        if (refuelingsWithConsumption.size() < MINIMUM_HISTORY_FOR_ANOMALY_CHECK) {
            return null;
        }

        BigDecimal sum = refuelingsWithConsumption.stream()
                .map(Fuel::getConsumptionKmL)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal count = BigDecimal.valueOf(refuelingsWithConsumption.size());
        BigDecimal averageConsumption = sum.divide(count, 4, RoundingMode.HALF_UP);
        return averageConsumption;
    }


}
