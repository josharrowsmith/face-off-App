import React, { Component } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Card, Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import {Camera, Permissions, takeSnapshotAsync, ImagePicker } from 'expo'


export default class adduser extends Component {

  static navigationOptions = {
    title: '',
    headerStyle: {
      backgroundColor: '#9DD6EB',
      height: 50
    },
  };
state = { currentUser: null,
          email: '',
          password: '',
          hasCameraPermission: null,
          type: Camera.Constants.Type.front,
          data: '',
          imageUri: null,
          fileUri: null,
          status: null,
          loading: false,
          loading2: false,
          downloadURL: null}


async componentWillMount() {
  const { currentUser } = firebase.auth()
  this.setState({
    currentUser : currentUser.email,
  })
}

// Function: pickImage
// Description: Uploading a photo to cloudinary to use later
// Input: image
// Output: a cloudinary url
  pickImage = async () => {
    const cameraRollPermissions = Permissions.CAMERA_ROLL;
    const { status } = await Permissions.askAsync(cameraRollPermissions);

    if (status === 'granted') {
    let result = await ImagePicker.launchCameraAsync({
      aspect: [4, 3],
      base64: true,
      quality: 0.1
    });
    this.setState({
      loading: true
    })

    if (!result.cancelled) {

      let base64Img = `data:image/jpg;base64,${result.base64}`
      //Add your cloud name
      let apiUrl = 'https://api.cloudinary.com/v1_1/yourid/image/upload';

      let data = {
        "file": base64Img,
        "upload_preset": "",
        "folder": '',
      }

      fetch(apiUrl, {
        body: JSON.stringify(data),
        headers:{
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        method: 'POST',
      }).then((response) => response.json())
        .then((data) => {
          console.log(data.secure_url);
          this.setState({
            data: data.secure_url,
            loading: false
          })
        })
        .catch((error) => {
          console.log(error);
        });
      }
  }
}

// Function: _addUser
// Description: add the user to the kairos db
// Input: image, email, password
// Output:login in user ?
_addUser = async () => {
  this.setState({
    loading2: true
  })
  var headers = {
    "Content-type": "application/json",
    "app_id": "",
    "app_key": ""
  };
  var payload = {
    "image":this.state.data,
    "subject_id": this.state.email +"|" + this.state.password +"|" + this.state.data,
    "gallery_name":""
  };
  var url = 'https://api.kairos.com/enroll';

  var initObject = {
    method: 'post',
    headers: headers,
    body: JSON.stringify(payload)
  };

  try {
      const response = await fetch(url, initObject);
      const json = await response.json();
      this.register()
    } catch (error) {
      console.log(error)
    }
}

// Function: register
// Description: makes new user
// Input: username and password
// Output: new user with face login
register = () => {
  const navigation = this.props.navigation;
  firebase
    .auth()
    .createUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(function() {
      alert("Done, now try login !!!")
      navigation.navigate('Splash');
    })
    .catch(function(error) {
      alert(error.message);
    });
};

  render() {
    const width = '20%';
    const height = '5%';
    return (
      <View style={styles.form}>
        <ScrollView>
          <KeyboardAvoidingView behavior = 'position' >
      <Card
        title="Add User"
        titleStyle={{ color: '#06062D', fontSize: 30, justifyContent: 'center'}}
        containerStyle={{ backgroundColor: 'white', alignItems: 'center' ,borderColor: 'white'}}>
        <View style={{ backgroundColor: 'transparent' }}>
            {this.state.data
              ? <Image
                  source={{ uri: this.state.data }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                    alignSelf: 'center',
                  }}
                />
              : <View
                  style={{
                    alignSelf: 'center',
                    backgroundColor: 'lightgrey',
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                  }}
                />}
          </View>
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
          title="Take Photo"
          color="#06062D"
          loading={this.state.loading}
          loadingProps={{ size: "large", color: "rgba(111, 202, 186, 1)" }}
          textStyle={{ fontSize: 20, fontWeight: 'bold' }}
          buttonStyle={{ marginTop: 8, backgroundColor: '#9DAEC6' }}
          onPress={this.pickImage}
        />
        <Button
          title="Set User"
          color="#06062D"
          loading={this.state.loading2}
          loadingProps={{ size: "large", color: "rgba(111, 202, 186, 1)" }}
          disabled={!this.state.data || !this.state.email || !this.state.password}
          textStyle={{ fontSize: 20, fontWeight: 'bold' }}
          buttonStyle={{ marginTop: 8, backgroundColor: '#9DAEC6' }}
          onPress={this._addUser}
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
    backgroundColor: '#2A4C75'
  },
  form: {
    flex: 1,
    backgroundColor: '#9DD6EB',

  }
})
