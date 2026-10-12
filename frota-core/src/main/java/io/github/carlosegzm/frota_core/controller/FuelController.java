package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import io.github.carlosegzm.frota_core.service.FuelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@Tag(name = "Fuels", description = "Fuel logs and consumption analysis")
@RequestMapping("/fuels")
public class FuelController {

    private final FuelService fuelService;

    @Operation(summary = "Register fueling", description = "Calculates consumption in km/L and flags anomalous consumption (more than 20% deviation from the recent average). Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<FuelResponse> create(@RequestBody @Valid FuelRequest request) {
        FuelResponse createdFuel = fuelService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFuel);
    }

    @Operation(summary = "List fuel records")
    @GetMapping
    public ResponseEntity<List<FuelResponse>> listAll() {
        List<FuelResponse> fuelList = fuelService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(fuelList);
    }

    @Operation(summary = "Find fuel record by ID")
    @GetMapping("/{id}")
    public ResponseEntity<FuelResponse> findById(@PathVariable UUID id) {
        FuelResponse foundFuel = fuelService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundFuel);
    }

    @Operation(summary = "Get average consumption", description = "Average km/L of the last 10 refuelings of a vehicle. Cached in Redis.")
    @GetMapping("/vehicles/{vehicleId}/average-consumption")
    public ResponseEntity<BigDecimal> getAverageConsumption(@PathVariable UUID vehicleId) {
        BigDecimal average = fuelService.getAverageConsumption(vehicleId);
        return ResponseEntity.status(HttpStatus.OK).body(average);
    }

}
