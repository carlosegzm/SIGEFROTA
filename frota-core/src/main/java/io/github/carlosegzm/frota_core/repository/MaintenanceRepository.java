package io.github.carlosegzm.frota_core.repository;

import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MaintenanceRepository extends JpaRepository<Maintenance, UUID> {
}
