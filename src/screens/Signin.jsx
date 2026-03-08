import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import g from "../styles/globalStyles";

const Signin = ({ navigation }) => {

    const [focusedInput, setFocusedInput] = useState('');
    const [user_name, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const handleSubmit = async () => {
        if (password !== confirmedPassword) {
            alert("Passwords don't match");
            return;
        }

        try {
            const res = await fetch("http://192.168.100.7:5000/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            navigation.navigate('LogIn');

        } catch (error) {
            console.log("Fetch error:", error);
            alert("server error: " + error.message);
        }
    };

    return (
        <SafeAreaView style={g.container}>
            <Text style={g.title}>Sign in</Text>
            <View style={g.form}>
                <Text style={g.label}>User name</Text>
                <TextInput
                    style={[g.input, focusedInput === 'username' && g.inputFocused]}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Enter username"
                    placeholderTextColor="#888"
                    onChangeText={text => setUserName(text)}
                />
                <Text style={g.label}>Email</Text>
                <TextInput
                    keyboardType="email-address"
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
                    onChangeText={text => setPassword(text)}
                />
                <Text style={g.label}>Confirm Password</Text>
                <TextInput
                    secureTextEntry
                    style={[g.input, focusedInput === 'confirm' && g.inputFocused]}
                    onFocus={() => setFocusedInput('confirm')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Confirm password"
                    placeholderTextColor="#888"
                    onChangeText={text => setConfirmedPassword(text)}
                />
                <Pressable style={g.button} onPress={handleSubmit}>
                    <Text style={g.buttonText}>Sign In</Text>
                </Pressable>
                <Pressable style={g.link} onPress={() => navigation.navigate('LogIn')}>
                    <Text style={g.linkText}>I already have an account</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Signin;
