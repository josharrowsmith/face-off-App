import React, { Component } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Card, Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';

export default class login extends Component {
  static navigationOptions = {
    title: '',
    headerStyle: {
      backgroundColor: '#9DD6EB',
      height: 50
    },
  };

 state = {
  email: '',
  password: '',
  loading: false
};


// Function: accept
// Description: Login for user
// Input: username and password
// Output: change page
accept = () => {
  const navigation = this.props.navigation;
  firebase
    .auth()
    .signInWithEmailAndPassword(this.state.email, this.state.password)
    .then(function() {
      navigation.navigate('LoggedIn');
    })
    .catch(function(error) {
      alert(error.message);
    });
};

// Function: register
// Description: register a user
// Input: email and password
// Output: new user
register = () => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(this.state.email, this.state.password)
    .catch(function(error) {
      alert(error.message);
    });
};


  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
        <KeyboardAvoidingView behavior = 'position' >
        <Card
          title="LOGIN"
          titleStyle={{ color: '#06062D', fontSize: 30, justifyContent: 'center'}}
          containerStyle={styles.form}>
          <Icon
          name='email'
          size={100}
          color='black'/>
          <FormLabel labelStyle={{ fontSize: 28, color: '#06062D' }}>
            Email
          </FormLabel>
          <FormInput
            value={this.state.email}
            onChangeText={value => this.setState({ email: value })}
            inputStyle={{ fontSize: 28, color: '#06062D' }}
            placeholder="email address"
          />
          <FormLabel labelStyle={{ fontSize: 28, color: '#06062D' }}>
            Password
          </FormLabel>
          <FormInput
            secureTextEntry
            value={this.state.password}
            onChangeText={value => this.setState({ password: value })}
            inputStyle={{ fontSize: 28, color: '#06062D' }}
            placeholder="password"
          />
          <Button
            title="Login"
            color="#06062D"
            disabled={!this.state.email || !this.state.password}
            textStyle={{ fontSize: 20, fontWeight: 'bold' }}
            buttonStyle={{ marginTop: 8, backgroundColor: '#9DAEC6' }}
            onPress={this.accept}
          />
        </Card>
        </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9DD6EB'
  },
  form: {
    flex: 1.2,
    marginTop: 50,
    backgroundColor: 'white',
  },
  card: {
    flex: 0.2
  }
})
