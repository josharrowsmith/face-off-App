import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Card, Button } from 'react-native-elements';
import * as firebase from 'firebase';


export default class loggedIn extends Component {

  static navigationOptions = {
    title: '',
    headerStyle: {
      backgroundColor: '#9DD6EB',
      height: 50
    },
  };
state = { currentUser: null}

componentDidMount() {
  const { currentUser } = firebase.auth()
  this.setState({
    currentUser : currentUser.email
  })
}

changePage = () => {
 this.props.navigation.navigate('Adduser');
};

  render() {
    return (
      <View style={{alignItems:'center'}}>
        <Text style={{fontSize: 30 }}>Welcome  {this.state.currentUser}</Text>
        <Image
           style={{width: 300, height: 200, marginTop: 100, }}
           source={{uri: 'https://media.giphy.com/media/3oKIPt3ojbmx5rRd0A/giphy.gif'}} />
          <Button title="Add User" onPress={this.changePage}></Button>
      </View>
    );
  }
}
