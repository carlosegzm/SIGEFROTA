package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.MaintenanceType;
import io.github.carlosegzm.frota_core.dto.request.MaintenanceRequest;
import io.github.carlosegzm.frota_core.dto.response.MaintenanceResponse;
import io.github.carlosegzm.frota_core.repository.MaintenanceRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @InjectMocks
    private MaintenanceService maintenanceService;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RLock rLock;

    // -> CREATE <-

    @Test
    @DisplayName("Should calculate next due values when vehicle exists")
    void create_shouldCalculateNextDueValues_whenVehicleExists() throws InterruptedException {
        MaintenanceRequest request = new MaintenanceRequest(
                UUID.randomUUID(),
                MaintenanceType.OIL_CHANGE,
                10000,
                LocalDate.now()
        );

        Vehicle vehicle = Vehicle.builder()
                .id(request.vehicleId())
                .build();

        when(redissonClient.getLock(anyString())).thenReturn(rLock);
        when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.save(any(Maintenance.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        MaintenanceResponse response = maintenanceService.create(request);
        assertNotNull(response);
        assertEquals(MaintenanceType.OIL_CHANGE, response.type());
        assertEquals(request.registeredKm() + 10000, response.nextDueKm());
        assertEquals(request.performedAt().plusMonths(6), response.nextDueDate());

        verify(maintenanceRepository, times(1)).save(any(Maintenance.class));
    }

    @Test
    @DisplayName("Should throw exception when vehicle is not found")
    void create_shouldThrowException_whenVehicleNotFound() throws InterruptedException {
        MaintenanceRequest request = new MaintenanceRequest(
                UUID.randomUUID(),
                MaintenanceType.OIL_CHANGE,
                10000,
                LocalDate.now()
        );

        when(redissonClient.getLock(anyString())).thenReturn(rLock);
        when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> maintenanceService.create(request));

        verify(maintenanceRepository, never()).save(any());
    }

    // -> LIST ALL <-

    @Test
    @DisplayName("Should return all maintenances")
    void listAll_shouldReturnAllMaintenances() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        Maintenance maintenance1 = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(MaintenanceType.INSPECTION)
                .build();

        Maintenance maintenance2 = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(MaintenanceType.TIRE_REPLACEMENT)
                .build();

        when(maintenanceRepository.findAll()).thenReturn(List.of(maintenance1, maintenance2));

        List<MaintenanceResponse> responses = maintenanceService.listAll();
        assertEquals(2, responses.size());
        assertEquals(MaintenanceType.INSPECTION, responses.getFirst().type());
        assertEquals(MaintenanceType.TIRE_REPLACEMENT, responses.getLast().type());
    }

    // -> FIND BY ID <-

    @Test
    @DisplayName("Should return maintenance when it exists")
    void findById_shouldReturnMaintenance_whenExists() {
        UUID id = UUID.randomUUID();

        Vehicle vehicle = Vehicle.builder()
                .id(id)
                .build();

        Maintenance maintenance = Maintenance.builder()
                .id(id)
                .vehicle(vehicle)
                .type(MaintenanceType.INSPECTION)
                .registeredKm(19500)
                .build();

        when(maintenanceRepository.findById(id)).thenReturn(Optional.of(maintenance));

        MaintenanceResponse response = maintenanceService.findById(id);
        assertEquals(id, response.id());
        assertEquals(19500, response.registeredKm());
        assertEquals(vehicle.getId(), response.vehicleId());
    }

    @Test
    @DisplayName("Should throw exception when maintenance is not found")
    void findById_shouldThrowException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(maintenanceRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> maintenanceService.findById(id));
    }

}