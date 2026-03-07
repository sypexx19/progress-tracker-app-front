import {View , ScrollView , Text , TextInput , TouchableOpacity
, KeyboardAvoidingView , StyleSheet , Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



const Login = ({ navigation }) =>{

    const { login } = useContext(AuthContext);

    const [focusedInput, setFocusedInput] = useState('');
    const [email,setEmail]=useState("");
    const [user_password,setUserPassword]=useState("");

  

    const handleSubmit = async () => {

        try{

            const res= await fetch("http://192.168.100.7:5000/api/auth/login",{
                method: "POST",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify({
                    email,
                    user_password
                })
            });

            const data = await res.json();
            console.log("SERVER RESPONSE:", data);

            if (!res.ok){ /* message in case of failed response */
                alert(data.message || "login failed ");
                return;
            }
              
            login(data.user, data.token);

            navigation.replace('Home')
        }catch (error) {
            console.log("Fetch error:", error);
            alert("server error: " + error.message);
        }

    }

  

    return (

        <SafeAreaView style={styles.container} >
        <Text style={styles.title} > Log in </Text>
        <View style={styles.form} >
            <Text style={styles.label} > Email</Text>
            <TextInput
                style={[
                    styles.input,
                    focusedInput === 'username' && styles.inputFocused
                ]}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput('')}
                placeholder="Enter email"
                onChangeText={text => setEmail(text)}/>
            <Text style={styles.label} > Password </Text>
            <TextInput secureTextEntry
                style={[
                    styles.input,
                    focusedInput === 'password' && styles.inputFocused
                ]}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                placeholder="Enter password"
                onChangeText={text => setUserPassword(text)}/>
           <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}> Log in </Text>
           </Pressable>
           <Pressable style={styles.link} onPress={() => navigation.replace('SignIn')}><Text style={styles.linkText}> I dont have an account</Text></Pressable>
        </View>
        </SafeAreaView>
        
    )
}

export default Login ;

const styles = StyleSheet.create({

container:{
    flex: 1,
    backgroundColor: '#111', // dark background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
},
title: {
    fontSize: 36,
    color: '#ff6600', // orange accent
    fontWeight: 'bold',
    marginBottom: 40
},
form: {
    width: '100%'
},

label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6
},

input: {
    borderWidth: 1,
    borderColor: '#555', // default grey border
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    color: '#fff'
},

inputFocused: {
    borderColor: '#ff6600' // border color when input is focused
},

button: {
    backgroundColor: '#ff6600',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
},

buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
},

link : {
    alignItems : 'center',
    marginTop : 10
},

linkText : {
    color: '#fff',
    fontSize: 16,
    textDecorationLine : 'underline'
}
})
