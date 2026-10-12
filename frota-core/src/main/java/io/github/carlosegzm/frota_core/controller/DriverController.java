package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.DriverRequest;
import io.github.carlosegzm.frota_core.dto.response.DriverResponse;
import io.github.carlosegzm.frota_core.service.DriverService;
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
@Tag(name = "Drivers", description = "Driver management")
@RequestMapping("/drivers")
public class DriverController {

    private final DriverService driverService;

    @Operation(summary = "Create driver", description = "Requires the FLEET_MANAGER role. The license number must be unique.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<DriverResponse> create(@RequestBody @Valid DriverRequest request) {
        DriverResponse createdDriver = driverService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDriver);
    }

    @Operation(summary = "List drivers")
    @GetMapping
    public ResponseEntity<List<DriverResponse>> listAll() {
        List<DriverResponse> driverList = driverService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(driverList);
    }

    @Operation(summary = "Find driver by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> findById(@PathVariable UUID id) {
        DriverResponse foundDriver = driverService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundDriver);
    }

    @Operation(summary = "Update driver", description = "Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> update(@PathVariable UUID id, @RequestBody @Valid DriverRequest request) {
        DriverResponse updatedDriver = driverService.update(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedDriver);
    }

    @Operation(summary = "Deactivate driver", description = "Soft delete: the driver is kept as inactive. Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        driverService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


}
