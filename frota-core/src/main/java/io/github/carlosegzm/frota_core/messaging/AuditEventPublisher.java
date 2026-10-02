package io.github.carlosegzm.frota_core.messaging;

import io.github.carlosegzm.frota_core.config.kafka.KafkaConfig;
import io.github.carlosegzm.frota_core.dto.message.AuditEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class AuditEventPublisher {

    private final KafkaTemplate<String, AuditEvent> kafkaTemplate;

    public void publish(AuditEvent event) {
        kafkaTemplate.send(KafkaConfig.AUDIT_TOPIC, event.entityId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Audit event successfully sent to Kafka! Entity: {}", event.entityType());
                    } else {
                        log.error("Failed to send event to Kafka.: {}", ex.getMessage());
                    }
                });
    }


}
