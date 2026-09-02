package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import io.github.carlosegzm.frota_core.dto.request.VehicleRequest;
import io.github.carlosegzm.frota_core.dto.request.VehicleStatusRequest;
import io.github.carlosegzm.frota_core.dto.response.VehicleResponse;
import io.github.carlosegzm.frota_core.mapper.VehicleMapper;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        if (vehicleRepository.findByPlate(request.plate()).isPresent()) {
            throw new IllegalArgumentException("Vehicle with this license plate already exists.");
        }

        Vehicle vehicle = VehicleMapper.toEntity(request);
        vehicle.setStatus(VehicleStatus.ACTIVE);

        Vehicle newVehicle = vehicleRepository.save(vehicle);
        return VehicleMapper.toResponse(newVehicle);
    }

    public List<VehicleResponse> listAll() {
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        return allVehicles.stream()
                .map(VehicleMapper::toResponse)
                .toList();
    }

    public VehicleResponse findById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));

        return VehicleMapper.toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse update(UUID id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getPlate().equals(request.plate()) && vehicleRepository.findByPlate(request.plate()).isPresent()) {
            throw new IllegalArgumentException("Vehicle with this plate already exists.");
        }

        vehicle.setPlate(request.plate());
        vehicle.setModel(request.model());
        vehicle.setBrand(request.brand());
        vehicle.setYear(request.year());
        vehicle.setCurrentKm(request.currentKm());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return VehicleMapper.toResponse(updatedVehicle);
    }

    @Transactional
    public VehicleResponse changeStatus(UUID id, VehicleStatusRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));

        vehicle.setStatus(request.status());
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return VehicleMapper.toResponse(updatedVehicle);
    }


    @Transactional
    public void delete(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));

        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicleRepository.save(vehicle);
    }


}
