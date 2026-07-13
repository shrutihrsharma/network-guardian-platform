package com.networkguardian.backend.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
class TestController {

    private final MongoTemplate mongoTemplate;

    TestController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/api/mongo-test")
    public String test() {
        return mongoTemplate.getDb().getName();
    }

}
