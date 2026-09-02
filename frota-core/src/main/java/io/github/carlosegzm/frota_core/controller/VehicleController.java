package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.VehicleRequest;
import io.github.carlosegzm.frota_core.dto.request.VehicleStatusRequest;
import io.github.carlosegzm.frota_core.dto.response.VehicleResponse;
import io.github.carlosegzm.frota_core.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@RequestBody @Valid VehicleRequest request) {
        VehicleResponse createdVehicle = vehicleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> listAll() {
        List<VehicleResponse> vehicleList = vehicleService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(vehicleList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> findById(@PathVariable UUID id) {
        VehicleResponse foundVehicle = vehicleService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundVehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> update(@PathVariable UUID id, @RequestBody @Valid VehicleRequest request) {
        VehicleResponse updatedVehicle = vehicleService.update(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedVehicle);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleResponse> changeStatus(@PathVariable UUID id, @RequestBody @Valid VehicleStatusRequest request) {
        VehicleResponse updatedVehicle = vehicleService.changeStatus(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedVehicle);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        vehicleService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
