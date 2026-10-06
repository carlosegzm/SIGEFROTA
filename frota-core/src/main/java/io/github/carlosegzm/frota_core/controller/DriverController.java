package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.DriverRequest;
import io.github.carlosegzm.frota_core.dto.response.DriverResponse;
import io.github.carlosegzm.frota_core.service.DriverService;
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
@RequestMapping("/drivers")
public class DriverController {

    private final DriverService driverService;

    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<DriverResponse> create(@RequestBody @Valid DriverRequest request) {
        DriverResponse createdDriver = driverService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDriver);
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> listAll() {
        List<DriverResponse> driverList = driverService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(driverList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> findById(@PathVariable UUID id) {
        DriverResponse foundDriver = driverService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundDriver);
    }


    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> update(@PathVariable UUID id, @RequestBody @Valid DriverRequest request) {
        DriverResponse updatedDriver = driverService.update(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedDriver);
    }

    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        driverService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


}
