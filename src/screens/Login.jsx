import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import g from "../styles/globalStyles";

const Login = ({ navigation }) => {

    const { login } = useContext(AuthContext);
    const [focusedInput, setFocusedInput] = useState('');
    const [email, setEmail] = useState("");
    const [user_password, setUserPassword] = useState("");

    const handleSubmit = async () => {
        try {
            const res = await fetch("http://192.168.100.7:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, user_password })
            });

            const data = await res.json();
            console.log("SERVER RESPONSE:", data);

            if (!res.ok) {
                alert(data.message || "login failed");
                return;
            }

            login(data.user, data.token);
            navigation.replace('Home');

        } catch (error) {
            console.log("Fetch error:", error);
            alert("server error: " + error.message);
        }
    };

    return (
        <SafeAreaView style={g.container}>
            <Text style={g.title}>Log in</Text>
            <View style={g.form}>
                <Text style={g.label}>Email</Text>
                <TextInput
                    style={[g.input, focusedInput === 'email' && g.inputFocused]}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Enter email"
                    placeholderTextColor="#888"
                    onChangeText={text => setEmail(text)}
                />
                <Text style={g.label}>Password</Text>
                <TextInput
                    secureTextEntry
                    style={[g.input, focusedInput === 'password' && g.inputFocused]}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Enter password"
                    placeholderTextColor="#888"
                    onChangeText={text => setUserPassword(text)}
                />
                <Pressable style={g.button} onPress={handleSubmit}>
                    <Text style={g.buttonText}>Log in</Text>
                </Pressable>
                <Pressable style={g.link} onPress={() => navigation.replace('SignIn')}>
                    <Text style={g.linkText}>I don't have an account</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Login;
