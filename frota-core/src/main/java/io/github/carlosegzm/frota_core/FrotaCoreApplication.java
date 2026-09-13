package io.github.carlosegzm.frota_core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FrotaCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(FrotaCoreApplication.class, args);
	}

}
