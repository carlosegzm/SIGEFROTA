package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.VehicleRequest;
import io.github.carlosegzm.frota_core.dto.request.VehicleStatusRequest;
import io.github.carlosegzm.frota_core.dto.response.VehicleResponse;
import io.github.carlosegzm.frota_core.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@Tag(name = "Vehicles", description = "Vehicle management")
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    @Operation(summary = "Create vehicle", description = "Requires the FLEET_MANAGER role. The plate must be unique.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<VehicleResponse> create(@RequestBody @Valid VehicleRequest request) {
        VehicleResponse createdVehicle = vehicleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
    }

    @Operation(summary = "List vehicles")
    @GetMapping
    public ResponseEntity<List<VehicleResponse>> listAll() {
        List<VehicleResponse> vehicleList = vehicleService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(vehicleList);
    }

    @Operation(summary = "Find vehicle by ID")
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> findById(@PathVariable UUID id) {
        VehicleResponse foundVehicle = vehicleService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundVehicle);
    }

    @Operation(summary = "Update vehicle", description = "Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> update(@PathVariable UUID id, @RequestBody @Valid VehicleRequest request) {
        VehicleResponse updatedVehicle = vehicleService.update(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedVehicle);
    }

    @Operation(summary = "Change vehicle status", description = "Sets the status to ACTIVE, IN_MAINTENANCE or INACTIVE. Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleResponse> changeStatus(@PathVariable UUID id, @RequestBody @Valid VehicleStatusRequest request) {
        VehicleResponse updatedVehicle = vehicleService.changeStatus(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedVehicle);
    }

    @Operation(summary = "Deactivate vehicle", description = "Soft delete: the vehicle is kept with the INACTIVE status. Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        vehicleService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
