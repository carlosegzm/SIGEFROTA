package io.github.carlosegzm.frota_core.config.rabbitmq;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ALERTS_QUEUE = "alerts.queue";
    public static final String ALERTS_EXCHANGE = "alerts.exchange";
    public static final String ALERTS_ROUTING_KEY = "alerts.expiration";

    @Bean
    public Queue alertsQueue() {
        return new Queue(ALERTS_QUEUE, true);
    }

    @Bean
    public DirectExchange alertsExchange() {
        return new DirectExchange(ALERTS_EXCHANGE);
    }

    @Bean
    public Binding alertsBinding(Queue alertsQueue, DirectExchange alertsExchange) {
        return BindingBuilder
                .bind(alertsQueue)
                .to(alertsExchange)
                .with(ALERTS_ROUTING_KEY);
    }


}
