FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /workspace
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN ./mvnw --batch-mode dependency:go-offline

COPY backend/src ./src
RUN ./mvnw --batch-mode -DskipTests package

FROM eclipse-temurin:17-jre-jammy

RUN groupadd --system app && useradd --system --gid app --home-dir /app app
WORKDIR /app
COPY --from=build --chown=app:app /workspace/target/bike-renting-backend-0.1.jar app.jar

USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
