package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Fuel;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import io.github.carlosegzm.frota_core.messaging.ExpirationAlertPublisher;
import io.github.carlosegzm.frota_core.repository.FuelRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FuelServiceTest {

    @InjectMocks
    private FuelService fuelService;

    @Mock
    private FuelRepository fuelRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ExpirationAlertPublisher expirationAlertPublisher;

    // -> CREATE <-

    @Test
    @DisplayName("Should save fuel when vehicle exists")
    void create_shouldSaveFuel_whenVehicleExists() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(339.5),
                53000
        );

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);
        assertNotNull(response);
        assertEquals(vehicle.getId(), response.vehicleId());
        assertEquals(BigDecimal.valueOf(339.50), response.totalCost());

        verify(fuelRepository, times(1)).save(any(Fuel.class));
    }

    @Test
    @DisplayName("Should throw exception when vehicle is not found")
    void create_shouldThrowException_whenVehicleNotFound() {
        FuelRequest request = new FuelRequest(
                UUID.randomUUID(),
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(339.5),
                53000
        );

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> fuelService.create(request));
        verify(fuelRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should calculate consumption when previous fuel exists")
    void create_shouldCalculateConsumption_whenPreviousFuelExists() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(339.5),
                50500
        );

        Fuel oldFuel = Fuel.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .odometerKm(50000)
                .build();

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.of(oldFuel));
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);
        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(500).divide(request.liters(), 2, RoundingMode.HALF_UP), response.consumptionKmL());
        verify(fuelRepository, times(1)).save(any(Fuel.class));
    }

    @Test
    @DisplayName("Should leave consumption null when no previous fuel exists")
    void create_shouldLeaveConsumptionNull_whenNoPreviousFuelExists() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(339.5),
                50500
        );

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.empty());
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);
        assertNotNull(response);
        assertNull(response.consumptionKmL());
        verify(fuelRepository, times(1)).save(any(Fuel.class));
    }

    @Test
    @DisplayName("Should throw exception when odometer is not greater than previous")
    void create_shouldThrowException_whenOdometerIsNotGreaterThanPrevious() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(339.5),
                50000
        );

        Fuel oldFuel = Fuel.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .odometerKm(50500)
                .build();

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.of(oldFuel));

        assertThrows(IllegalArgumentException.class, () -> fuelService.create(request));
        verify(fuelRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark as anomalous when deviation exceeds threshold")
    void create_shouldMarkAsAnomalous_whenDeviationExceedsThreshold() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 9, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(350),
                51000
        );

        Fuel previousFuel = Fuel.builder()
                .id(UUID.randomUUID())
                .odometerKm(50000)
                .build();

        Fuel historical1 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.0)).build();
        Fuel historical2 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.5)).build();
        Fuel historical3 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(9.5)).build();

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.of(previousFuel));
        when(fuelRepository.findTop10ByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(List.of(historical1, historical2, historical3));
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);

        assertEquals(BigDecimal.valueOf(20.00).setScale(2), response.consumptionKmL());
        assertTrue(response.anomalousConsumption());
        verify(expirationAlertPublisher, times(1)).publish(any());
    }

    @Test
    @DisplayName("Should not mark as anomalous when deviation is within threshold")
    void create_shouldNotMarkAsAnomalous_whenDeviationIsWithinThreshold() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 9, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(350),
                50525
        );

        Fuel previousFuel = Fuel.builder()
                .id(UUID.randomUUID())
                .odometerKm(50000)
                .build();

        Fuel historical1 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.0)).build();
        Fuel historical2 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.5)).build();
        Fuel historical3 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(9.5)).build();

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.of(previousFuel));
        when(fuelRepository.findTop10ByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(List.of(historical1, historical2, historical3));
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);

        assertEquals(BigDecimal.valueOf(10.50).setScale(2), response.consumptionKmL());
        assertFalse(response.anomalousConsumption());
        verify(expirationAlertPublisher, never()).publish(any());
    }

    @Test
    @DisplayName("Should leave anomalousConsumption null when history is insufficient")
    void create_shouldLeaveAnomalousConsumptionNull_whenHistoryIsInsufficient() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        FuelRequest request = new FuelRequest(
                vehicle.getId(),
                LocalDate.of(2026, 9, 1),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(350),
                50525
        );

        Fuel previousFuel = Fuel.builder()
                .id(UUID.randomUUID())
                .odometerKm(50000)
                .build();

        Fuel historical1 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.0)).build();
        Fuel historical2 = Fuel.builder().id(UUID.randomUUID()).consumptionKmL(BigDecimal.valueOf(10.5)).build();

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(fuelRepository.findTopByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(Optional.of(previousFuel));
        when(fuelRepository.findTop10ByVehicleIdOrderByRefueledAtDesc(request.vehicleId())).thenReturn(List.of(historical1, historical2));
        when(fuelRepository.save(any(Fuel.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        FuelResponse response = fuelService.create(request);

        assertEquals(BigDecimal.valueOf(10.50).setScale(2), response.consumptionKmL());
        assertNull(response.anomalousConsumption());
    }

    // -> LIST ALL <-

    @Test
    @DisplayName("Should return all fuels")
    void listAll_shouldReturnAllFuels() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        Fuel fuel1 = Fuel.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .liters(BigDecimal.valueOf(53.5))
                .build();

        Fuel fuel2 = Fuel.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .liters(BigDecimal.valueOf(72.45))
                .build();

        when(fuelRepository.findAll()).thenReturn(List.of(fuel1, fuel2));

        List<FuelResponse> responses = fuelService.listAll();
        assertEquals(2, responses.size());
        assertEquals(BigDecimal.valueOf(53.50), responses.getFirst().liters());
        assertEquals(BigDecimal.valueOf(72.45), responses.getLast().liters());
    }

    // -> FIND BY ID <-

    @Test
    @DisplayName("Should return fuel when it exists")
    void findById_shouldReturnFuel_whenExists() {
        UUID id = UUID.randomUUID();

        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        Fuel fuel = Fuel.builder()
                .id(id)
                .vehicle(vehicle)
                .liters(BigDecimal.valueOf(53.5))
                .build();

        when(fuelRepository.findById(id)).thenReturn(Optional.of(fuel));

        FuelResponse response = fuelService.findById(id);
        assertEquals(id, response.id());
        assertEquals(BigDecimal.valueOf(53.5), response.liters());
        assertEquals(vehicle.getId(), response.vehicleId());
    }

    @Test
    @DisplayName("Should throw exception when fuel is not found")
    void findById_shouldThrowException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(fuelRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> fuelService.findById(id));
    }


}