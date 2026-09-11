package io.github.carlosegzm.frota_core.domain.enums;

public enum MaintenanceType {
    OIL_CHANGE(10000, 6),
    INSPECTION(20000, 12),
    TIRE_REPLACEMENT(40000, 24);

    private final int kmInterval;
    private final int monthsInterval;

    MaintenanceType(int kmInterval, int monthsInterval) {
        this.kmInterval = kmInterval;
        this.monthsInterval = monthsInterval;
    }

    public int getKmInterval() {
        return kmInterval;
    }

    public int getMonthsInterval() {
        return monthsInterval;
    }

}
