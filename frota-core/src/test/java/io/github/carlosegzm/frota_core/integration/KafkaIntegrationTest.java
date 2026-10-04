package io.github.carlosegzm.frota_core.integration;

import io.github.carlosegzm.frota_core.config.kafka.KafkaConfig;
import io.github.carlosegzm.frota_core.dto.message.AuditEvent;
import io.github.carlosegzm.frota_core.messaging.AuditEventPublisher;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.KafkaConsumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class KafkaIntegrationTest extends IntegrationTestBase {

    @Autowired
    private AuditEventPublisher publisher;

    @Test
    void shouldPublishAuditEventToKafkaTopic() {
        AuditEvent event = new AuditEvent(
                UUID.randomUUID(),
                "VEHICLE",
                "CREATED",
                Instant.now()
        );

        publisher.publish(event);

        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group");
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JacksonJsonDeserializer.class);
        consumerProps.put(JacksonJsonDeserializer.TRUSTED_PACKAGES, "io.github.carlosegzm.frota_core.dto.message");

        try (Consumer<String, AuditEvent> consumer = new KafkaConsumer<>(consumerProps)) {
            consumer.subscribe(java.util.List.of(KafkaConfig.AUDIT_TOPIC));

            ConsumerRecord<String, AuditEvent> record = KafkaTestUtils.getSingleRecord(consumer, KafkaConfig.AUDIT_TOPIC);

            assertNotNull(record);
            assertEquals(event.entityId(), record.value().entityId());
            assertEquals(event.entityType(), record.value().entityType());
        }
    }
}