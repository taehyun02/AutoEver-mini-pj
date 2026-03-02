FROM quay.io/debezium/connect:2.5

# MongoDB 싱크 커넥터 라이브러리 다운로드 및 설치
RUN curl https://repo1.maven.org/maven2/org/mongodb/kafka/mongo-kafka-connect/1.11.0/mongo-kafka-connect-1.11.0-all.jar \
    -o /kafka/connect/debezium-connector-postgres/mongo-kafka-connect-1.11.0-all.jar
