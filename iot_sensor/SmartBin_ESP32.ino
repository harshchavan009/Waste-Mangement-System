#include <WiFi.h>
#include <HTTPClient.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API URL
const char* serverUrl = "http://YOUR_SERVER_IP:5001/api/iot/update";

// Bin details
const String binId = "BIN-ESP-01";
const String location = "Tech Park Gate 1";
const String binType = "Plastic";

// HC-SR04 Pins
const int trigPin = 5;
const int echoPin = 18;

// Bin physical parameters (in cm)
const float BIN_HEIGHT_CM = 100.0; 
const float SENSOR_OFFSET_CM = 5.0; // Distance from sensor to the top of the bin

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float distance = getDistance();
    
    // Calculate Fill Level Percentage
    // If distance is near BIN_HEIGHT_CM, it's empty (0%)
    // If distance is near SENSOR_OFFSET_CM, it's full (100%)
    float fillLevel = 100.0 * (1.0 - ((distance - SENSOR_OFFSET_CM) / (BIN_HEIGHT_CM - SENSOR_OFFSET_CM)));
    
    // Clamp between 0 and 100
    if (fillLevel < 0) fillLevel = 0;
    if (fillLevel > 100) fillLevel = 100;

    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print(" cm | Fill Level: ");
    Serial.print(fillLevel);
    Serial.println("%");

    sendDataToBackend(fillLevel);
  }
  
  // Wait 10 seconds before next reading (adjust for production)
  delay(10000); 
}

float getDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2.0;
  return distanceCm;
}

void sendDataToBackend(float fillLevel) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Payload
  String jsonPayload = "{\"id\":\"" + binId + "\",";
  jsonPayload += "\"location\":\"" + location + "\",";
  jsonPayload += "\"type\":\"" + binType + "\",";
  jsonPayload += "\"level\":" + String(fillLevel) + "}";

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error sending POST: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}
