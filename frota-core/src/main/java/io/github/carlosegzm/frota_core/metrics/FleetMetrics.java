package io.github.carlosegzm.frota_core.metrics;

import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class FleetMetrics {

    private final VehicleRepository vehicleRepository;
    private final MeterRegistry meterRegistry;

    @PostConstruct
    public void registerGauges() {
        for (VehicleStatus status : VehicleStatus.values()) {
            Gauge.builder("sigefrota_vehicles_total", () -> vehicleRepository.countByStatus(status))
                    .description("Number of vehicles by status")
                    .tag("status", status.name())
                    .register(meterRegistry);
        }
    }


}
