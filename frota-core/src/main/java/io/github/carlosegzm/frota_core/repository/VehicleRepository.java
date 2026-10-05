package io.github.carlosegzm.frota_core.repository;

import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    Optional<Vehicle> findByPlate(String plate);
    long countByStatus(VehicleStatus status);
}
