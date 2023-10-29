import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TextInput, Button, View } from "react-native";
import { useEffect, useState } from "react";
import * as MailComposer from "expo-mail-composer";
import * as Print from "expo-print";
import axios from "axios";
// const baseUrl = 'https://reqres.in';
// expo add expo-print expo-mail-composer

const EmployeeLogin = () => {
  const [sound, setSound] = useState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);
  const [Sockett, setSockett] = useState(null);
  const [AlarmOn, setAlarmOn] = useState(false);

  const handlePlay = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/classic-alarm-1.mp3")
    );
    setSound(sound);
    await sound.playAsync();
  };

  const handleStop = async () => {
    await sound.stopAsync();
    setSound(null);
  };

  const connectToSocket = async () => {
    console.log("connectToSocket");
    const userData = JSON.parse(await AsyncStorage.getItem("user"));
    console.log("userData--> ", userData);
    console.log("userData.city", userData.city);
    console.log('userData["city"]', userData["city"]);
    let soc = new WebSocket(
      `ws://10.0.2.2:8000/ws/alert/${userData["city"]}/${userData["state"]}/`
    );
    /*
{"data": "{\"description\": \"alert ! \", \"location\": \"Latitude: 30.355065 Longitude: 78.0204769\", \"city\": \"DEHRADUN\", \"state\": \"UTTRAKHAND\", \"categories\": []}", "isTrusted": false}
*/
    soc.onopen = (e) => {
      console.log("opened socket ! ", e);
    };

    soc.onmessage = (e) => {
      // got alert from here !
      console.log("on message", e);
      if (!e) return;

      let data = JSON.parse(e.data);
      console.log("data ", data);

      handlePlay(); // THIS WILL RUN THE ALARM AUDIO

      Alert.alert("ALERT !", `${data.description}`, [
        {
          text: "Cancel",
          onPress: () => handleStop(), //
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    };
    // TODO SOME HOW ADD SOUND !
    soc.onerror = (e) => {
      console.log("on error", e);
    };
    await AsyncStorage.setItem("user", JSON.stringify(soc));
    // Connected to ws://127.0.0.1:8000/ws/alert/DEHRADUN/UTTRAKHAND/
    console.log("socket ", soc);
    setSockett(soc);
  };

  const handleLogin = async () => {
    console.log("email", email);
    console.log("password", password);

    // const { data } = await axios.post(
    //   "/http://127.0.0.1:8000/alert/loginEmployee",
    //   {
    //     username: email,
    //     password,
    //   }
    // );
    // console.log("data in employee login ", data);
    let bodyy = JSON.stringify({
      username: email,
      password: password,
    });

    console.log("bodyy", bodyy);

    axios
      .post(`http://10.0.2.2:8000/alert/loginEmployee`, bodyy)
      .then(async (res) => {
        console.log("result.data ", res.data);
        setUserData(res.data);
        await AsyncStorage.setItem("user", JSON.stringify(res.data));
        // connect to socket
        connectToSocket();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmployeeLogin</Text>
      <TextInput
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
});

export default EmployeeLogin;
