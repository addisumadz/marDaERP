package com.wbill.home;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WbillApplication {

	public static void main(String[] args) {
		SpringApplication.run(WbillApplication.class, args);
	}

}
