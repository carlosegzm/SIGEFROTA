package io.github.carlosegzm.frota_core.dto.message;

import java.time.Instant;
import java.util.UUID;

public record AuditEvent(
        UUID entityId,
        String entityType,
        String action,
        Instant timestamp
) {
}
