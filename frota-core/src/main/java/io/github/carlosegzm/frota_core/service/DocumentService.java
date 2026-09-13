package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.dto.request.DocumentRequest;
import io.github.carlosegzm.frota_core.dto.response.DocumentResponse;
import io.github.carlosegzm.frota_core.mapper.DocumentMapper;
import io.github.carlosegzm.frota_core.repository.DocumentRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public DocumentResponse create(DocumentRequest request) {

        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.vehicleId()));

        Document document = DocumentMapper.toEntity(request);
        document.setVehicle(vehicle);

        Document savedDocument = documentRepository.save(document);
        return DocumentMapper.toResponse(savedDocument);
    }

    public List<DocumentResponse> listAll() {
        List<Document> allDocuments = documentRepository.findAll();
        return allDocuments.stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    public DocumentResponse findById(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with ID: " + id));

        return DocumentMapper.toResponse(document);
    }

}
