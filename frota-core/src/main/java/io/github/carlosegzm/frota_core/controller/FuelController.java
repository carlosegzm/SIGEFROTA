package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.FuelRequest;
import io.github.carlosegzm.frota_core.dto.response.FuelResponse;
import io.github.carlosegzm.frota_core.service.FuelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/fuels")
public class FuelController {

    private final FuelService fuelService;

    @PostMapping
    public ResponseEntity<FuelResponse> create(@RequestBody @Valid FuelRequest request) {
        FuelResponse createdFuel = fuelService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFuel);
    }

    @GetMapping
    public ResponseEntity<List<FuelResponse>> listAll() {
        List<FuelResponse> fuelList = fuelService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(fuelList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelResponse> findById(@PathVariable UUID id) {
        FuelResponse foundFuel = fuelService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundFuel);
    }


}
