import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Modal,
  StatusBar,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GenerateQuizScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [amountOfQuestions, setAmountOfQuestions] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [apiSessionToken, setApiSessionToken] = useState("");
  const [useToken, setUseToken] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTokenEmpty, setIsTokenEmpty] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      setCategories(data.trivia_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchApiSessionToken = async () => {
    try {
      const response = await fetch(
        "https://opentdb.com/api_token.php?command=request"
      );
      const data = await response.json();
      if (data.response_code === 0) {
        return data.token;
      } else {
        console.error(
          `Error fetching token: ${data.response_message}. Error code: ${data.response_code}`
        );
        Alert.alert(
          `Error fetching token: ${data.response_message}. Error code: ${data.response_code}`
        );
      }
    } catch (err) {
      console.error(`Unexpected error: ${err}`);
      Alert.alert(`Unexpected error: ${err}`);
    }
  };

  const resetApiSessionToken = async () => {
    try {
      const response = await fetch(
        `https://opentdb.com/api_token.php?command=reset&token=${apiSessionToken}`
      );
      const data = await response.json();
      if (data.response_code === 0) {
        Alert.alert("Reset successful!");
        hideTokenEmpty()
      } else {
        Alert.alert("Error. Something went wrong while resetting the token");
      }
    } catch (err) {
      console.error(`Error resetting token: ${err}`);
    }
  };

  const getApiSessionToken = async () => {
    try {
      const existingToken = await AsyncStorage.getItem("API-Token");
      if (existingToken !== null) {
        setApiSessionToken(existingToken);
      } else {
        const token = await fetchApiSessionToken();
        await AsyncStorage.setItem("API-Token", token);
        setApiSessionToken(token);
      }
    } catch (err) {
      console.error(`Unexpected error: ${err}`);
      Alert.alert(`Unexpected error: ${err}`);
    }
  };

  const generateQueryUrl = () => {
    const apiUrl = "https://opentdb.com/api.php";
    const queryParams = [`amount=${amountOfQuestions}`];

    if (category) queryParams.push(`category=${category}`);
    if (difficulty) queryParams.push(`difficulty=${difficulty}`);
    if (type) queryParams.push(`type=${type}`);
    if (apiSessionToken && useToken)
      queryParams.push(`token=${apiSessionToken}`);

    const queryUrl = `${apiUrl}?${queryParams.join("&")}`;
    return queryUrl;
  };

  const fetchQuestions = async () => {
    try {
      const url = generateQueryUrl();
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  const generateQuiz = async () => {
    const data = await fetchQuestions();
    if (data.response_code === 0) {
      navigation.navigate("Game", { questions: data.results });
    } else if (data.response_code === 4) {
      showTokenEmpty()
    } else {
      let errorMessage = "";

      switch (data.response_code) {
        case 1:
          errorMessage =
            "No Results: Could not return results. The API doesn't have enough questions for your query (e.g., asking for 50 questions in a category that only has 20).";
          break;
        case 2:
          errorMessage =
            "Invalid Parameter: Contains an invalid parameter. Arguments passed aren't valid (e.g., Amount = 'Five' instead of a number).";
          break;
        case 3:
          errorMessage = "Token Not Found: Session Token does not exist.";
          break;
        case 5:
          errorMessage =
            "Rate Limit Exceeded: Too many requests. Each IP can only access the API once every 5 seconds.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
      }
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  useEffect(() => {
    fetchCategories();
    getApiSessionToken();
  }, []);

  const showInfo = () => {
    setIsInfoOpen(true);
    StatusBar.setBackgroundColor("rgba(0, 0, 0, 0.7)");
  };
  const hideInfo = () => {
    setIsInfoOpen(false);
    StatusBar.setBackgroundColor("#FFF");
  };

  const showTokenEmpty = () => {
    setIsTokenEmpty(true)
    StatusBar.setBackgroundColor("#rgba(0, 0, 0, 0.7)");
  }
  const hideTokenEmpty = () => {
    setIsTokenEmpty(false)
    StatusBar.setBackgroundColor("#FFF");
  }

  return (
    <View style={styles.page}>
      <Modal
        visible={isInfoOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={hideInfo}
      >
        <View style={styles.modalFull}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 16 }}>
              When the switch is toggled on, the app will make sure that you are
              not asked the same questions multiple times, even if you close the
              app and come back!
            </Text>
            <View>
              <Text style={{ marginBottom: 8, fontSize: 16 }}>
                This is a manual reset button. If you click this you may get the
                same questions again. Automatic resets happen after 6 hours of
                inactivity. If the app detects it has ran out of questions to
                ask you based on the options you provided you will be asked if
                you want to reset.
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetApiSessionToken}
              >
                <Text style={{ color: "#FFF" }}>RESET</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeInfoButton} onPress={hideInfo}>
              <Text style={{ color: "#FFF" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isTokenEmpty}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTokenEmpty}
      >
        <View style={styles.modalFull}>
          <View style={[styles.modalContainer, {height:"40%"}]}>
            <Text style={{fontSize:16, marginBottom:8}}>
              The app has ran out of new questions to ask you with these specific options.
              Would you like to reset your token?
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetApiSessionToken}>
              <Text style={{color:"#FFF"}}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeInfoButton} onPress={hideTokenEmpty}>
              <Text style={{color:"#FFF"}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.genericLabel}>Number of questions</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{amountOfQuestions}</Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={50}
          step={1}
          value={amountOfQuestions}
          onValueChange={(value) => setAmountOfQuestions(value)}
          minimumTrackTintColor="#001011ff"
          maximumTrackTintColor="#666"
          thumbTintColor="#444"
        />
      </View>

      <Text style={styles.genericLabel}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => {
          setCategory(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="All categories" value={""} />
        {categories.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>

      <Text style={styles.genericLabel}>Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => {
          setDifficulty(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Any difficulty" value={""} />
        <Picker.Item label="Easy" value={"easy"} />
        <Picker.Item label="Medium" value={"medium"} />
        <Picker.Item label="Hard" value={"hard"} />
      </Picker>

      <Text style={styles.genericLabel}>Question type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => {
          setType(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Any type" value={""} />
        <Picker.Item label="Multiple choice" value={"multiple"} />
        <Picker.Item label="True / False" value={"boolean"} />
      </Picker>

      <View style={{ display: "flex", flexDirection: "row" }}>
        <Text style={styles.genericLabel}>Avoid asking same questions? </Text>
        <TouchableOpacity onPress={showInfo}>
          <Text style={{ fontStyle: "italic" }}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <Switch
        style={{ margin: 0 }}
        trackColor={{ false: "red", true: "green" }}
        value={useToken}
        onValueChange={() => setUseToken((prev) => !prev)}
      ></Switch>

      <Text>{generateQueryUrl()}</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => generateQuiz()}
      >
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#EEE",
  },
  modalFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "100%",
    height: "70%",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#666",
    paddingVertical: 8,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  closeInfoButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  genericLabel: {
    marginBottom: 8,
    color: "#001011ff",
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    width: "100%",
    marginBottom: 24,
  },
  slider: {
    width: "80%",
    paddingLeft: 8,
  },
  sliderLabel: {
    fontSize: 16,
  },
  picker: {
    marginBottom: 24,
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
  },
  selection: {
    marginTop: 20,
    fontSize: 18,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 3,
    borderRadius: 24,
    borderColor: "#001011ff",
    backgroundColor: "#001011ff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
});