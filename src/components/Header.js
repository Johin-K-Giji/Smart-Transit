import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const weatherIconMap = {
  Sunny: "weather-sunny",
  Clear: "weather-sunny",
  "Partly cloudy": "weather-partly-cloudy",
  Cloudy: "weather-cloudy",
  Overcast: "weather-cloudy",
  Mist: "weather-fog",
  Fog: "weather-fog",
  "Patchy rain possible": "weather-partly-rainy",
  "Light rain": "weather-rainy",
  Rain: "weather-rainy",
  "Heavy rain": "weather-pouring",
  Thunderstorm: "weather-lightning",
  Snow: "weather-snowy",
  "Heavy snow": "weather-snowy-heavy",
};

const Header = ({ weather, locationDetails, selectedMode, onModeChange, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderLocation = () => {
    if (!locationDetails) return <Text>Fetching location...</Text>;

    const { formattedAddress } = locationDetails;
    const addressParts = formattedAddress.split(",");
    const relevantAddress = addressParts.slice(0, 5).join(", ");

    return (
      <View style={styles.locationBox}>
        <Text style={styles.locationDetail}>
          {relevantAddress || "Unknown Location"}
        </Text>
      </View>
    );
  };

  const transportModes = [
    { id: "HomeScreen", label: "Home", icon: "home" },
    { id: "BusStop", label: "Bus Stops", icon: "bus" },
    { id: "Complaint", label: "Complaint", icon: "alert-circle" },
    { id: "EmergencyCall", label: "Emergency Call", icon: "phone" },
  ];

  const handleModeChange = (modeId) => {
    if (modeId === "EmergencyCall") {
      handleEmergencyCall();
      return;
    }

    onModeChange(modeId);
    navigation.navigate(modeId);
    setIsMenuOpen(false);
  };

  const handleEmergencyCall = () => {
    const phoneNumber = "tel:1234567890";
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert(
        "Error",
        "Unable to make a call. Please check your device settings."
      );
    });
  };

  return (
    <View style={styles.headerContainer}>
      {/* Location Box */}
      {renderLocation()}

      {/* Weather Info */}
      <View style={styles.weatherContainer}>
        {weather ? (
          <>
            <MaterialCommunityIcons
              name={weatherIconMap[weather.current.condition.text] || "weather-cloudy"}
              size={30}
              color="#FFD700"
            />
            <Text style={styles.temperature}>
              {Math.round(weather.current.temp_c)}°C
            </Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </View>

      {/* Hamburger Icon */}
      <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.hamburgerIcon}>
        <MaterialCommunityIcons name="menu" size={30} color="white" />
      </TouchableOpacity>

      {/* Burger Menu Modal */}
      <Modal visible={isMenuOpen} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Option</Text>

            {transportModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.transportModeWrapper,
                  selectedMode === mode.id && styles.activeMode,
                ]}
                onPress={() => handleModeChange(mode.id)}
              >
                <MaterialCommunityIcons
                  name={mode.icon}
                  size={28}
                  color={selectedMode === mode.id ? "#007AFF" : "#333"}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    selectedMode === mode.id && styles.activeModeLabel,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Close Modal Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuOpen(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "black",
    paddingVertical: 30,
    alignItems: "center",
    position: "relative",
  },
  locationBox: {
    backgroundColor: "#F8F8F8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationDetail: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    marginLeft: 10,
  },
  loadingText: {
    color: "black",
  },
  hamburgerIcon: {
    position: "absolute",
    top: 0,
    right: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Subtle overlay
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    width: 320,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  transportModeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 12,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeMode: {
    backgroundColor: "#E6F7FF",
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
  },
  activeModeLabel: {
    color: "#007AFF",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#FF4D4D",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Header;
