package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.DocumentRequest;
import io.github.carlosegzm.frota_core.dto.response.DocumentResponse;
import io.github.carlosegzm.frota_core.service.DocumentService;
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
@Tag(name = "Documents", description = "Vehicle documents and expiration dates")
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Register document", description = "Registers a vehicle document (CRLV, insurance or licensing) with its expiration date. Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<DocumentResponse> create(@RequestBody @Valid DocumentRequest request) {
        DocumentResponse createdDocument = documentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDocument);
    }

    @Operation(summary = "List documents")
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> listAll() {
        List<DocumentResponse> documentList = documentService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(documentList);
    }

    @Operation(summary = "Find document by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> findById(@PathVariable UUID id) {
        DocumentResponse foundDocument = documentService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundDocument);
    }

}
