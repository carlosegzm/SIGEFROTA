package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import io.github.carlosegzm.frota_core.domain.entities.Vehicle;
import io.github.carlosegzm.frota_core.domain.enums.DocumentType;
import io.github.carlosegzm.frota_core.dto.request.DocumentRequest;
import io.github.carlosegzm.frota_core.dto.response.DocumentResponse;
import io.github.carlosegzm.frota_core.repository.DocumentRepository;
import io.github.carlosegzm.frota_core.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @InjectMocks
    private DocumentService documentService;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    // -> CREATE <-

    @Test
    @DisplayName("Should save document when vehicle exists")
    void create_shouldSaveDocument_whenVehicleExists() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        DocumentRequest request = new DocumentRequest(
                vehicle.getId(),
                DocumentType.INSURANCE,
                LocalDate.of(2026, 03, 01),
                LocalDate.of(2030, 03, 01)
        );

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.of(vehicle));
        when(documentRepository.save(any(Document.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        DocumentResponse response = documentService.create(request);
        assertNotNull(response);
        assertEquals(DocumentType.INSURANCE, response.type());
        assertEquals(LocalDate.of(2026, 03, 01), response.issuedAt());
        assertEquals(LocalDate.of(2030, 03, 01), response.expiresAt());

        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    @DisplayName("Should throw exception when vehicle is not found")
    void create_shouldThrowException_whenVehicleNotFound() {
        DocumentRequest request = new DocumentRequest(
                UUID.randomUUID(),
                DocumentType.INSURANCE,
                LocalDate.of(2026, 03, 01),
                LocalDate.of(2030, 03, 01)
        );

        when(vehicleRepository.findById(request.vehicleId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> documentService.create(request));
        verify(documentRepository, never()).save(any());
    }

    // -> LIST ALL <-

    @Test
    @DisplayName("Should return all documents")
    void listAll_shouldReturnAllDocuments() {
        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        Document document1 = Document.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(DocumentType.INSURANCE)
                .build();

        Document document2 = Document.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(DocumentType.LICENSING)
                .build();

        when(documentRepository.findAll()).thenReturn(List.of(document1, document2));

        List<DocumentResponse> responses = documentService.listAll();
        assertEquals(2, responses.size());
        assertEquals(DocumentType.INSURANCE, responses.getFirst().type());
        assertEquals(DocumentType.LICENSING, responses.getLast().type());
    }

    // ->FIND BY ID <-

    @Test
    @DisplayName("Should return document when it exists")
    void findById_shouldReturnDocument_whenExists() {
        UUID id = UUID.randomUUID();

        Vehicle vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .build();

        Document document = Document.builder()
                .id(id)
                .vehicle(vehicle)
                .type(DocumentType.INSURANCE)
                .build();

        when(documentRepository.findById(id)).thenReturn(Optional.of(document));

        DocumentResponse response = documentService.findById(id);
        assertNotNull(response);
        assertEquals(id, response.id());
        assertEquals(DocumentType.INSURANCE, response.type());
    }

    @Test
    @DisplayName("Should throw exception when document is not found")
    void findById_shouldThrowException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(documentRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> documentService.findById(id));
    }


}