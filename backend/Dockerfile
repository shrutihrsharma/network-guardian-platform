# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /workspace

# Copy dependency metadata first for better layer caching.
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./
RUN chmod +x mvnw

# Download dependencies before copying source code.
RUN ./mvnw dependency:go-offline

# Copy the app source and build the jar.
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy only the packaged Spring Boot jar.
COPY --from=builder /workspace/target/*.jar /app/app.jar

# Render provides the PORT environment variable.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]