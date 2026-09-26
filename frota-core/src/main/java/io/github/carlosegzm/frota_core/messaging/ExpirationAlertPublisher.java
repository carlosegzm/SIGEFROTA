package io.github.carlosegzm.frota_core.messaging;

import io.github.carlosegzm.frota_core.config.rabbitmq.RabbitMQConfig;
import io.github.carlosegzm.frota_core.dto.message.ExpirationAlertMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ExpirationAlertPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(ExpirationAlertMessage message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ALERTS_EXCHANGE,
                RabbitMQConfig.ALERTS_ROUTING_KEY,
                message
        );
    }


}
