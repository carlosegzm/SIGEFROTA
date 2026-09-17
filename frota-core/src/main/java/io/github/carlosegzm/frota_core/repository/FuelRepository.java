package io.github.carlosegzm.frota_core.repository;

import io.github.carlosegzm.frota_core.domain.entities.Fuel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FuelRepository extends JpaRepository<Fuel, UUID> {
    Optional<Fuel> findTopByVehicleIdOrderByRefueledAtDesc(UUID vehicleId);
    List<Fuel> findTop10ByVehicleIdOrderByRefueledAtDesc(UUID vehicleId);
}
