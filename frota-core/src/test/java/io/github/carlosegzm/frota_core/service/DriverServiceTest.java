package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Driver;
import io.github.carlosegzm.frota_core.dto.request.DriverRequest;
import io.github.carlosegzm.frota_core.dto.response.DriverResponse;
import io.github.carlosegzm.frota_core.repository.DriverRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverServiceTest {

    @InjectMocks
    private DriverService driverService;

    @Mock
    private DriverRepository driverRepository;

    // -> CREATE <-

    @Test
    @DisplayName("Should save driver when license number is new")
    void create_shouldSaveDriver_whenLicenseNumberIsNew() {
        DriverRequest request = new DriverRequest(
                "Carlos Eduardo",
                "12345678900",
                "B",
                LocalDate.now().plusYears(2),
                "(49) 9999-0000"
        );

        when(driverRepository.findByLicenseNumber(request.licenseNumber())).thenReturn(Optional.empty());
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DriverResponse response = driverService.create(request);
        assertNotNull(response);
        assertEquals("Carlos Eduardo", response.name());
        assertTrue(response.active());
        verify(driverRepository, times(1)).save(any(Driver.class));

    }

    @Test
    @DisplayName("Should throw exception when license number already exists")
    void create_shouldThrowException_whenLicenseNumberAlreadyExists() {
        DriverRequest request = new DriverRequest(
                "Carlos Eduardo",
                "12345678900",
                "B",
                LocalDate.now().plusYears(2),
                "(49) 9999-0000"
        );

        Driver existingDriver = Driver.builder()
                .id(UUID.randomUUID())
                .licenseNumber("12345678900")
                .build();

        when(driverRepository.findByLicenseNumber(request.licenseNumber())).thenReturn(Optional.of(existingDriver));

        assertThrows(IllegalArgumentException.class, () -> driverService.create(request));
        verify(driverRepository, never()).save(any());
    }

    // -> FIND BY ID <-

    @Test
    @DisplayName("Should return driver when it exists")
    void findById_shouldReturnDriver_whenExists() {
        UUID id = UUID.randomUUID();
        Driver driver = Driver.builder()
                .id(id)
                .name("Carlos Eduardo")
                .active(true)
                .build();

        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));

        DriverResponse response = driverService.findById(id);

        assertEquals(id, response.id());
        assertEquals("Carlos Eduardo", response.name());
    }

    @Test
    @DisplayName("Should throw exception when driver is not found")
    void findById_shouldThrowException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(driverRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> driverService.findById(id));
    }

    // -> UPDATE <-

    @Test
    @DisplayName("Should update fields when request is valid")
    void update_shouldUpdateFields_whenValid() {
        UUID id = UUID.randomUUID();

        Driver existingDriver = Driver.builder()
                .id(id)
                .name("Carlos")
                .licenseNumber("12345678900")
                .licenseCategory("B")
                .licenseExpiration(LocalDate.now().plusYears(1))
                .phone("(49) 90000-0000")
                .active(true)
                .build();

        DriverRequest request = new DriverRequest(
                "Carlos Eduardo",
                "12345678900",
                "AB",
                LocalDate.now().plusYears(3),
                "(49) 91111-1111"
        );

        when(driverRepository.findById(id)).thenReturn(Optional.of(existingDriver));
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DriverResponse response = driverService.update(id, request);
        assertEquals("Carlos Eduardo", response.name());
        assertEquals("AB", response.licenseCategory());
    }

    // -> DELETE <-

    @Test
    @DisplayName("Should set active to false instead of deleting")
    void delete_shouldSetActiveFalse_insteadOfDeleting() {
        UUID id = UUID.randomUUID();
        Driver driver = Driver.builder()
                .id(id)
                .active(true)
                .build();

        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));

        driverService.delete(id);

        ArgumentCaptor<Driver> captor = ArgumentCaptor.forClass(Driver.class);
        verify(driverRepository).save(captor.capture());

        Driver savedDriver = captor.getValue();
        assertFalse(savedDriver.isActive());

        verify(driverRepository, never()).deleteById(any());
    }


}