package io.github.carlosegzm.frota_core.integration;

import io.github.carlosegzm.frota_core.config.rabbitmq.RabbitMQConfig;
import io.github.carlosegzm.frota_core.domain.enums.AlertType;
import io.github.carlosegzm.frota_core.dto.message.ExpirationAlertMessage;
import io.github.carlosegzm.frota_core.messaging.ExpirationAlertPublisher;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class RabbitMQIntegrationTest extends IntegrationTestBase{

    @Autowired
    private ExpirationAlertPublisher publisher;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void shouldPublishMessageToAlertsQueue() {
        ExpirationAlertMessage message = new ExpirationAlertMessage(
                UUID.randomUUID(),
                "ABC1D23",
                AlertType.MAINTENANCE,
                "Test alert",
                LocalDate.now().plusDays(10)
        );

        publisher.publish(message);

        ExpirationAlertMessage received = (ExpirationAlertMessage) rabbitTemplate
                .receiveAndConvert(RabbitMQConfig.ALERTS_QUEUE, 5000);

        assertNotNull(received);
        assertEquals(message.plate(), received.plate());
        assertEquals(message.alertType(), received.alertType());
    }


}
