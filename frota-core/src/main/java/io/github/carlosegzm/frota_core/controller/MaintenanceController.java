package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.MaintenanceRequest;
import io.github.carlosegzm.frota_core.dto.response.MaintenanceResponse;
import io.github.carlosegzm.frota_core.service.MaintenanceService;
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
@RequestMapping("/maintenances")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<MaintenanceResponse> create(@RequestBody @Valid MaintenanceRequest request) {
        MaintenanceResponse createdMaintenance = maintenanceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMaintenance);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>> listAll() {
        List<MaintenanceResponse> maintenanceList = maintenanceService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(maintenanceList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> findById(@PathVariable UUID id) {
        MaintenanceResponse foundMaintenance = maintenanceService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundMaintenance);
    }


}
