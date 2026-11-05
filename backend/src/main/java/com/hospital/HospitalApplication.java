package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.hospital.repository")
public class HospitalApplication {
    public static void main(String[] args) { SpringApplication.run(HospitalApplication.class, args); }
}
