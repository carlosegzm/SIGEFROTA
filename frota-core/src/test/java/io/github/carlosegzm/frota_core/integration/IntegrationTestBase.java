package io.github.carlosegzm.frota_core.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.kafka.KafkaContainer;

import java.time.Duration;

@SpringBootTest
public abstract class IntegrationTestBase {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withStartupTimeout(Duration.ofSeconds(120));

    static RabbitMQContainer rabbitMQ = new RabbitMQContainer("rabbitmq:3-management-alpine")
            .withStartupTimeout(Duration.ofSeconds(120));

    static KafkaContainer kafka = new KafkaContainer("apache/kafka:3.8.0")
            .withStartupTimeout(Duration.ofSeconds(120));

    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379)
            .withStartupTimeout(Duration.ofSeconds(120));

    static {
        postgres.start();
        rabbitMQ.start();
        kafka.start();
        redis.start();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);

        registry.add("spring.rabbitmq.host", rabbitMQ::getHost);
        registry.add("spring.rabbitmq.port", rabbitMQ::getAmqpPort);
        registry.add("spring.rabbitmq.username", rabbitMQ::getAdminUsername);
        registry.add("spring.rabbitmq.password", rabbitMQ::getAdminPassword);

        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);

        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));

        registry.add("jwt.secret", () -> "SecretRandomJWT");
    }


}
