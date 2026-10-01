package io.github.carlosegzm.frota_notification.messaging;

import io.github.carlosegzm.frota_notification.config.rabbitmq.RabbitMQConfig;
import io.github.carlosegzm.frota_notification.dto.message.ExpirationAlertMessage;
import io.github.carlosegzm.frota_notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class AlertConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.ALERTS_QUEUE)
    public void handleAlert(@Payload ExpirationAlertMessage message) {
        log.info("-> Message received in the queue!");
        notificationService.sendAlertEmail(message);
    }

}
