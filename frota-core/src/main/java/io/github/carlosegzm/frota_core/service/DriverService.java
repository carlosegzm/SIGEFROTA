package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Driver;
import io.github.carlosegzm.frota_core.dto.request.DriverRequest;
import io.github.carlosegzm.frota_core.dto.response.DriverResponse;
import io.github.carlosegzm.frota_core.mapper.DriverMapper;
import io.github.carlosegzm.frota_core.repository.DriverRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class DriverService {

    private final DriverRepository driverRepository;

    @Transactional
    public DriverResponse create(DriverRequest request) {

        if (driverRepository.findByLicenseNumber(request.licenseNumber()).isPresent()) {
            throw new IllegalArgumentException("Driver with this license number already exists.");
        }

        Driver driver = DriverMapper.toEntity(request);
        driver.setActive(true);

        Driver newDriver = driverRepository.save(driver);
        return DriverMapper.toResponse(newDriver);
    }

    public List<DriverResponse> listAll() {
        List<Driver> allDrivers = driverRepository.findAll();
        return allDrivers.stream()
                .map(DriverMapper::toResponse)
                .toList();
    }

    public DriverResponse findById(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        return DriverMapper.toResponse(driver);
    }


    @Transactional
    public DriverResponse update(UUID id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        if (!driver.getLicenseNumber().equals(request.licenseNumber()) && driverRepository.findByLicenseNumber(request.licenseNumber()).isPresent()) {
            throw new IllegalArgumentException("Driver with this license number already exists.");
        }

        driver.setName(request.name());
        driver.setLicenseNumber(request.licenseNumber());
        driver.setLicenseCategory(request.licenseCategory());
        driver.setLicenseExpiration(request.licenseExpiration());
        driver.setPhone(request.phone());

        Driver updatedDriver = driverRepository.save(driver);
        return DriverMapper.toResponse(updatedDriver);
    }

    @Transactional
    public void delete(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        driver.setActive(false);
        driverRepository.save(driver);
    }

}
