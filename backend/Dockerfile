FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy project files and build an executable Spring Boot jar.
COPY pom.xml ./
COPY .mvn ./.mvn
COPY mvnw ./
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the packaged application jar from the build stage.
COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]