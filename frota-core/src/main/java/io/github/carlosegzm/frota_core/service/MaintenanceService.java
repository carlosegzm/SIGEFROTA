package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.request.MaintenanceRequest;
import io.github.carlosegzm.frota_core.dto.response.MaintenanceResponse;
import io.github.carlosegzm.frota_core.mapper.MaintenanceMapper;
import io.github.carlosegzm.frota_core.repository.MaintenanceRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {

        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID:" + request.vehicleId()));

        Maintenance maintenance = MaintenanceMapper.toEntity(request);
        maintenance.setVehicle(vehicle);
        maintenance.setNextDueKm(request.registeredKm() + request.type().getKmInterval());
        maintenance.setNextDueDate(request.performedAt().plusMonths(request.type().getMonthsInterval()));

        Maintenance savedMaintenance = maintenanceRepository.save(maintenance);
        return MaintenanceMapper.toResponse(savedMaintenance);
    }

    public List<MaintenanceResponse> listAll() {
        List<Maintenance> allMaintenances = maintenanceRepository.findAll();
        return allMaintenances.stream()
                .map(MaintenanceMapper::toResponse)
                .toList();
    }

    public MaintenanceResponse findById(UUID id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance not found with ID:" + id));

        return MaintenanceMapper.toResponse(maintenance);
    }


}
