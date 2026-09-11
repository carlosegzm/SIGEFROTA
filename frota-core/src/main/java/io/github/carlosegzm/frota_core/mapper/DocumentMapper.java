package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import io.github.carlosegzm.frota_core.dto.request.DocumentRequest;
import io.github.carlosegzm.frota_core.dto.response.DocumentResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class DocumentMapper {

    public static Document toEntity(DocumentRequest request) {
        return Document.builder()
                .type(request.type())
                .issuedAt(request.issuedAt())
                .expiresAt(request.expiresAt())
                .build();
    }

    public static DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .vehicleId(document.getVehicle().getId())
                .type(document.getType())
                .issuedAt(document.getIssuedAt())
                .expiresAt(document.getExpiresAt())
                .build();
    }


}
