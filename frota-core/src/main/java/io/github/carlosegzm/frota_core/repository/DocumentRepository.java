package io.github.carlosegzm.frota_core.repository;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
}
