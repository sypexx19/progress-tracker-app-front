import {View , ScrollView , Text , TextInput , TouchableOpacity
    , KeyboardAvoidingView , StyleSheet , Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react";

const Signin = ({ navigation }) =>{

    const [focusedInput, setFocusedInput] = useState('');
    const [user_name,setUserName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [confirmedPassword,setConfirmedPassword]=useState("");

    const handleSubmit = async () => {
        if (password != confirmedPassword){
            alert("Passwords doesnt match");
            return; }
        
        try{
            const res= await fetch("http://192.168.100.7:5000/api/auth/signin",{
                method: "POST",
                headers : { "Content-Type" : "application/json"},
                body : JSON.stringify({
                    user_name,
                    email,
                    password
                })
            });
            const data = await res.json();
            if (!res.ok){  /* message in case of failed response */
                alert(data.message);
                return;
            }
            navigation.navigate('LogIn')
        }catch (error) {
            console.log("Fetch error:", error )
            alert("server error: " + error.message);
        }
    }

  

    return (

        <SafeAreaView style={styles.container} >
            <Text style={styles.title} > Sign in </Text>
            <View style={styles.form} >
                <Text style={styles.label} > User name </Text>
                <TextInput
                    style={[
                        styles.input,
                        focusedInput === 'username' && styles.inputFocused
                    ]}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Enter username"
                    onChangeText={text => setUserName(text)}/>
                <Text style={styles.label} > Email </Text>
                <TextInput 
                    keyboardType="email-adress"
                    style={[
                        styles.input,
                        focusedInput === 'email' && styles.inputFocused
                    ]}
                    onFocus={() => setFocusedInput('email')}
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
                    onChangeText={text => setPassword(text)}/>
                <Text style={styles.label} > Confirm Password </Text>
                <TextInput secureTextEntry
                    style={[
                        styles.input,
                        focusedInput === 'confirm' && styles.inputFocused
                    ]}
                    onFocus={() => setFocusedInput('confirm')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Confirm password"
                    onChangeText={text => setConfirmedPassword(text)}/>
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </Pressable>
                <Pressable style={styles.link} onPress={() => navigation.navigate('LogIn')} ><Text style={styles.linkText}> I already have an account</Text></Pressable>

            </View>
        </SafeAreaView>

    )

}

  

export default Signin ;

const styles = StyleSheet.create({

container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
},

title: {
    fontSize: 36,
    color: '#ff6600',  
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
    borderColor: '#555',
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

