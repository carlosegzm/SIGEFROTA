ALTER TABLE drivers
    ALTER COLUMN license_number SET NOT NULL,
    ALTER COLUMN license_category SET NOT NULL,
    ALTER COLUMN license_expiration SET NOT NULL,
    ADD CONSTRAINT uq_drivers_license_number UNIQUE (license_number);
