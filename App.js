import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { StackNavigator, createStackNavigator } from 'react-navigation';
import * as firebase from 'firebase';
import LoggedIn from './components/logged-in/loggedIn'
import Camera from './components/home/camera'
import Splash from './components/home/splash'
import Login from './components/home/login'
import Adduser from './components/logged-in/adduser'


var config = {
  apiKey: "",
	 authDomain: "",
	 databaseURL: "",
	 projectId: "",
	 storageBucket: "",
	 messagingSenderId: ""
};
!firebase.apps.length ? firebase.initializeApp(config) : null;

const App = createStackNavigator(
  {
    LoggedIn: LoggedIn,
    Camera: Camera,
    Splash: Splash,
    Login: Login,
    Adduser: Adduser
  },
  {
    initialRouteName: 'Splash',
  }
);


export default App;
