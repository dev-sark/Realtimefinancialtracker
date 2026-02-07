package com.finance.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RealtimeFinanceTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(RealtimeFinanceTrackerApplication.class, args);
    }

}
