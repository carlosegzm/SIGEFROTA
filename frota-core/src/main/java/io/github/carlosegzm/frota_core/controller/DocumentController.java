package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.DocumentRequest;
import io.github.carlosegzm.frota_core.dto.response.DocumentResponse;
import io.github.carlosegzm.frota_core.service.DocumentService;
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
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PostMapping
    public ResponseEntity<DocumentResponse> create(@RequestBody @Valid DocumentRequest request) {
        DocumentResponse createdDocument = documentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDocument);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> listAll() {
        List<DocumentResponse> documentList = documentService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(documentList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> findById(@PathVariable UUID id) {
        DocumentResponse foundDocument = documentService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(foundDocument);
    }

}
