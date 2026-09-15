package io.github.carlosegzm.frota_core.domain.entities;

import io.github.carlosegzm.frota_core.domain.enums.FuelType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fuels")
public class Fuel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    private FuelType type;

    @Column(nullable = false)
    private LocalDate refueledAt;

    @Column(nullable = false)
    private BigDecimal liters;

    @Column(nullable = false)
    private BigDecimal totalCost;

    @Column(nullable = false)
    private Integer odometerKm;

    @Column(name = "consumption_km_l")
    private BigDecimal consumptionKmL;

}
