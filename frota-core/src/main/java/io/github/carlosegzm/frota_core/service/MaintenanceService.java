package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.message.AuditEvent;
import io.github.carlosegzm.frota_core.dto.request.MaintenanceRequest;
import io.github.carlosegzm.frota_core.dto.response.MaintenanceResponse;
import io.github.carlosegzm.frota_core.exception.custom.BusinessRuleException;
import io.github.carlosegzm.frota_core.exception.custom.ResourceNotFoundException;
import io.github.carlosegzm.frota_core.mapper.MaintenanceMapper;
import io.github.carlosegzm.frota_core.messaging.AuditEventPublisher;
import io.github.carlosegzm.frota_core.repository.MaintenanceRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final RedissonClient redissonClient;
    private final AuditEventPublisher auditEventPublisher;

    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {

        String lockKey = "maintenance-lock: " + request.vehicleId();
        RLock lock = redissonClient.getLock(lockKey);

        try {
            boolean acquired = lock.tryLock(5, 10, TimeUnit.SECONDS);

            if (!acquired) {
                throw new BusinessRuleException("This vehicle is currently being processed. Try again shortly");
            }

            Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID:" + request.vehicleId()));

            Maintenance maintenance = MaintenanceMapper.toEntity(request);
            maintenance.setVehicle(vehicle);
            maintenance.setNextDueKm(request.registeredKm() + request.type().getKmInterval());
            maintenance.setNextDueDate(request.performedAt().plusMonths(request.type().getMonthsInterval()));

            Maintenance savedMaintenance = maintenanceRepository.save(maintenance);

            auditEventPublisher.publish(new AuditEvent(
                    maintenance.getId(),
                    "MAINTENANCE",
                    "CREATED",
                    Instant.now()
            ));

            return MaintenanceMapper.toResponse(savedMaintenance);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lock acquisition interrupted", e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }

    }

    public List<MaintenanceResponse> listAll() {
        List<Maintenance> allMaintenances = maintenanceRepository.findAll();
        return allMaintenances.stream()
                .map(MaintenanceMapper::toResponse)
                .toList();
    }

    public MaintenanceResponse findById(UUID id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found with ID:" + id));

        return MaintenanceMapper.toResponse(maintenance);
    }


}
