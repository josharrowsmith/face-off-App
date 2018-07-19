import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Swiper from 'react-native-swiper';
import { FormLabel, FormInput, Card, Button, Icon } from 'react-native-elements';


export default class splash extends Component {
  static navigationOptions = {
      header: null,
 }
  changePageCamera = () => {
   this.props.navigation.navigate('Camera');
  };

  changePageLogin = () => {
   this.props.navigation.navigate('Login');
  };

  render() {
    return (
      <Swiper style={styles.wrapper}>
       <View style={styles.slide1}>
         <Text style={{color: '#fff',fontSize: 50, fontWeight: 'bold'}}>FaceOff</Text>
       </View>
       <View style={styles.slide2}>
         <Text style={styles.text}>Login in with your face</Text>
       </View>
       <View style={styles.slide3}>
         <Card
           containerStyle={styles.card}
           title="Choose a Option">
           <Icon
           name='email'
           size={100}
           color='black'/>
         <Button title="Login with email" buttonStyle={styles.buttonStyle} onPress={this.changePageLogin}></Button>
            <Icon
            name='face'
            size={100}
            color='black'/>
          <Button title="Face Login" buttonStyle={styles.buttonStyle} onPress={this.changePageCamera}></Button>
          </Card>
       </View>
     </Swiper>

    );
  }
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20
  },
  buttonStyle: {
    backgroundColor: "rgba(92, 99,216, 1)",
    width: 200,
    height: 45,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 20
  }
});
