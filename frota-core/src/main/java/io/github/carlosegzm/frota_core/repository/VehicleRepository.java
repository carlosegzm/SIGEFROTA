package io.github.carlosegzm.frota_core.repository;

import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
}
