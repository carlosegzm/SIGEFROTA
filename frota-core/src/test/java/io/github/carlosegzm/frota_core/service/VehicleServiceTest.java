package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import io.github.carlosegzm.frota_core.dto.request.VehicleRequest;
import io.github.carlosegzm.frota_core.dto.request.VehicleStatusRequest;
import io.github.carlosegzm.frota_core.dto.response.VehicleResponse;
import io.github.carlosegzm.frota_core.messaging.AuditEventPublisher;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @InjectMocks
    private VehicleService vehicleService;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private AuditEventPublisher auditEventPublisher;

    // -> CREATE <-

    @Test
    @DisplayName("Should save vehicle when plate is new")
    void create_shouldSaveVehicle_whenPlateIsNew() {
        VehicleRequest request = new VehicleRequest(
                "ABC1234",
                "Sprinter 415",
                "Mercedes-Benz",
                2022,
                46500
        );

        when(vehicleRepository.findByPlate(request.plate())).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse response = vehicleService.create(request);
        assertNotNull(response);
        assertEquals("ABC1234", response.plate());
        assertEquals("Sprinter 415", response.model());

        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should throw exception when plate already exists")
    void create_shouldThrowException_whenPlateAlreadyExists() {
        VehicleRequest request = new VehicleRequest(
                "ABC1234",
                "Sprinter 415",
                "Mercedes-Benz",
                2022,
                46500
        );

        Vehicle existingVehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .plate("ABC1234")
                .build();

        when(vehicleRepository.findByPlate(request.plate())).thenReturn(Optional.of(existingVehicle));

        assertThrows(IllegalArgumentException.class, () -> vehicleService.create(request));
        verify(vehicleRepository, never()).save(any());
    }

    // -> FIND BY ID <-

    @Test
    @DisplayName("Should return vehicle when it exists")
    void findById_shouldReturnVehicle_whenExists() {
        UUID id = UUID.randomUUID();
        Vehicle vehicle = Vehicle.builder()
                .id(id)
                .plate("CBA4321")
                .build();

        when(vehicleRepository.findById(id)).thenReturn(Optional.of(vehicle));

        VehicleResponse response = vehicleService.findById(id);
        assertEquals(id, response.id());
        assertEquals("CBA4321", response.plate());
    }

    @Test
    @DisplayName("Should throw exception when vehicle is not found")
    void findById_shouldThrowException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(vehicleRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> vehicleService.findById(id));
    }

    // -> UPDATE <-

    @Test
    @DisplayName("Should update fields when request is valid")
    void update_shouldUpdateFields_whenValid() {
        UUID id = UUID.randomUUID();

        Vehicle existingVehicle = Vehicle.builder()
                .id(id)
                .plate("ABC1234")
                .model("Sprinter 415")
                .brand("Mercedes-Benz")
                .year(2022)
                .currentKm(46500)
                .build();

        VehicleRequest request = new VehicleRequest(
                "CBA4321",
                "Sprinter 415",
                "Mercedes-Benz",
                2022,
                52500
        );

        when(vehicleRepository.findById(id)).thenReturn(Optional.of(existingVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        VehicleResponse response = vehicleService.update(id, request);
        assertEquals("CBA4321", response.plate());
        assertEquals(52500, response.currentKm());
    }


    // -> CHANGE STATUS

    @Test
    @DisplayName("Should update vehicle status")
    void changeStatus_shouldUpdateStatus() {
        UUID id = UUID.randomUUID();
        Vehicle existingVehicle = Vehicle.builder()
                .id(id)
                .plate("ABC1234")
                .model("Sprinter 415")
                .brand("Mercedes-Benz")
                .year(2022)
                .currentKm(46500)
                .status(VehicleStatus.ACTIVE)
                .build();

        VehicleStatusRequest request = new VehicleStatusRequest(VehicleStatus.IN_MAINTENANCE);

        when(vehicleRepository.findById(id)).thenReturn(Optional.of(existingVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        VehicleResponse response = vehicleService.changeStatus(id, request);
        assertEquals(id, response.id());
        assertEquals(VehicleStatus.IN_MAINTENANCE, response.status());
    }

    // -> DELETE <-

    @Test
    @DisplayName("Should set status to inactive instead of deleting")
    void delete_shouldSetStatusInactive_insteadOfDeleting() {
        UUID id = UUID.randomUUID();
        Vehicle existingVehicle = Vehicle.builder()
                .id(id)
                .status(VehicleStatus.ACTIVE)
                .build();

        when(vehicleRepository.findById(id)).thenReturn(Optional.of(existingVehicle));

        vehicleService.delete(id);

        ArgumentCaptor<Vehicle> captor = ArgumentCaptor.forClass(Vehicle.class);
        verify(vehicleRepository).save(captor.capture());
        Vehicle savedVehicle = captor.getValue();

        assertEquals(VehicleStatus.INACTIVE, savedVehicle.getStatus());
        verify(vehicleRepository, never()).deleteById(any());
    }

}