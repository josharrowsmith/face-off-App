import {Camera, Permissions, takeSnapshotAsync, FaceDetector} from 'expo'
import { Container,Content,Header,Item,Icon,Input } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react';
import {Button, CameraRoll, Image, Text, View, StyleSheet, AppRegistry,
PixelRatio, TouchableOpacity } from 'react-native';
import firebase from '../../config/firebase';
import {AnimatedCircularProgress, CircularProgress} from 'react-native-circular-progress';
import { StackNavigator } from 'react-navigation';

const landmarkSize = 2;
export default class App extends React.Component {


  static navigationOptions = {
    title: '',
    headerStyle: {
      backgroundColor: '#9DD6EB',
      height: 50
    },
  };
  state = {
    hasCameraPermission: null,
    downloadURL: null,
    type: Camera.Constants.Type.front,
    data: null,
    capturing: false,
    text: 'Capture',
    flashMode: 'off',
    photos: [],
    faces: [],
    color: 'white',
    prefill: 0,
    fill: 0,
    width: '5',
    password: '',
    email: '',
    image: null
  }

  async componentWillMount() {
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    })
  }

  // Function: _timer
	// Description: Takes a photo every 5 seconds
	// Input: none
	// Output: runs _snap Function every 5 seconds
  _timer = async () => {
    if (this.state.capturing) {
      this.setState({capturing: false, text: 'Capture'})
      clearInterval(this.timerID)
    } else {
      this.setState({capturing: true, text: 'Stop Capturing'})
      this.timerID = setInterval(this._snap, 5000)
    }
  }

  // Function: _snap
	// Description: Takes a photo using expo camera then calls _upload Function
	// Input: none
	// Output: a photo
  _snap = async () => {
    this.setState({fill: 0, data: ''})
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({quality: 0.1, base64: true});
      this.setState({fill: 25,
                    color: 'white',
                    text: "Capture"})
      this._upload(photo.uri)
    }
  };

  // Function: _upload
	// Description: Uploads photo taken in _snap Function to firebase to get a url,
  // instead of blob which the face apis cant use.
	// Input: photo
	// Output: a url for the image uploaded
  _upload = async (image) => {
    this.setState({text: "Uplaoding"})
    const uri = image
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = 'test'
    const ref = firebase.storage().ref().child(filename);
    const snapshot = await ref.put(blob);
    this.setState({downloadURL: snapshot.downloadURL})
    this.setState({fill: 50})
    this._runApi(this.state.downloadURL)
  }

  // Function: _runApi
  // Description: Hits the kairos face api for face recognition and checks against
  // database for a match
  // Input: image
  // Output: a result of the image either a number or error
  _runApi = async (image) => {
    this.setState({text: 'testing'})
    var headers = {
      "Content-type": "application/json",
      "app_id": "",
      "app_key": ""
    };
    var payload = {
      "image": image,
      "gallery_name": "",
      "threshold": 0.1
    };
    var url = 'https://api.kairos.com/recognize';

    var initObject = {
      method: 'post',
      headers: headers,
      body: JSON.stringify(payload)
    };


    //need to fix auth, either build a server for firebase
    //Custom Tokens or encrypt with CryptoJS ??
    try {
        const response = await fetch(url, initObject);
        const json = await response.json();
        const result = await json.images[0].transaction.confidence.toString()
        const loginData = await json.images[0].transaction.subject_id.toString()
        const newdata = loginData.split("|");
        console.log(newdata)
        this.setState({data: result, text: "face found", email: newdata[0], password: newdata[1]})
        if(result > 0.65){
          this.setState({
            color: "green"
          })
          this.accept(this.state.email, this.state.password)
        }else {
          this.setState({
            text: "need over 65% you have  " + this.state.data,
            color: "red",
            image: newdata[2]
          })
        }
      } catch (error) {
        this.setState({
          text: 'no faces found',
          color: 'red'
        })
      }
      this.setState({
        fill: 100
      })
    }

  //logins in user
  accept = async (email, password) => {
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

  // Function: _onFlash
  // Description: changes flash state
  // Input: none
  // Output:
  onFlash = () => {
    const {flashMode} = this.state;
    this.setState({flashMode: flashModeOrder[flashMode]});
  };

  // Function: _onFlip
  // Description: changes camera faces
  // Input: none
  // Output:
  onFlip = () => {
    this.setState({
      type: this.state.type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    });
  };

  onFacesDetected = ({faces}) => this.setState({faces});
  onFaceDetectionError = state => console.warn('Faces detection error:', state);



  // Function: renderFace
  // Description: drawing image bounds
  // Input: renderFaces
  // Output: a box where image is
  renderFace({bounds, faceID, rollAngle, yawAngle}) {
    return (<View key={faceID} transform={[
        {
          perspective: 600
        }, {
          rotateZ: `${rollAngle.toFixed(0)}deg`
        }, {
          rotateY: `${yawAngle.toFixed(0)}deg`
        }
      ]} style={[
        styles.face, {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y
        }
      ]}></View>);
  }

  // Function: renderLandmarksOfFace
  // Description: drawing the landmark data
  // Input: renderLandmarks
  // Output: landmark mark view
  renderLandmarksOfFace(face) {
    const renderLandmark = position => position && (<View style={[
        styles.landmark, {
          left: position.x - landmarkSize / 2,
          top: position.y - landmarkSize / 2
        }
      ]}/>);
    return (<View key={`landmarks-${face.faceID}`}>
      {renderLandmark(face.leftEyePosition)}
      {renderLandmark(face.rightEyePosition)}
      {renderLandmark(face.leftEarPosition)}
      {renderLandmark(face.rightEarPosition)}
      {renderLandmark(face.leftCheekPosition)}
      {renderLandmark(face.rightCheekPosition)}
      {renderLandmark(face.leftMouthPosition)}
      {renderLandmark(face.mouthPosition)}
      {renderLandmark(face.rightMouthPosition)}
      {renderLandmark(face.noseBasePosition)}
      {renderLandmark(face.bottomMouthPosition)}
    </View>);
  }

  // Function: renderFaces
  // Description: looping over the renderFace Function to get face data
  // Returns a Promise that resolves to an object: { faces, image }
  // where faces is an array of the detected faces and image is an object
  // Input: none
  // Output:
  renderFaces() {
    return (<View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>);
  }

  // Function: renderLandmarks
  // Description: looping over the renderLandmark Function to get image data
  // Returns a Promise that resolves to an object: { faces, image }
  // where faces is an array of the detected faces and image is an object
  // Input: none
  // Output:
  renderLandmarks() {
    return (<View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>);
  }


  render() {
    const {image, hasCameraPermission} = this.state;
    if (hasCameraPermission === null) {
      return <View/>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <Camera
          ref={ref => {
          this.camera = ref;}}
          style={styles.container}
          type={this.state.type}
          ratio="16:9"
          faceDetectionLandmarks={Camera.Constants.FaceDetection.Landmarks.all}
          runClassifications={Camera.Constants.FaceDetection.Classifications.all}
          onFacesDetected={this.onFacesDetected}
          onFaceDetectionError={this.onFaceDetectionError}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={this.onFlip}>
            <Icon name="ios-reverse-camera" size={32} style={{
                color: '#fff'
              }}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="ios-flash" size={32} style={{
                color: '#fff'
              }}/>
          </TouchableOpacity>
        </View>
        <View style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end'
          }}></View>


        <View style={styles.bottomBar}>
          <View style={styles.bottomButton}>
             {this.state.image
               ? <Image
                   source={{ uri: this.state.image }}
                   style={{
                     width: 50,
                     height: 50,
                     borderRadius: 100,
                     alignSelf: 'flex-start',
                   }}
                 />
               : <View
                   style={{
                     alignSelf: 'flex-start',
                     backgroundColor: 'white',
                     width: 50,
                     height: 50,
                     borderRadius: 100,
                   }}
                 />}
         </View>
          <TouchableOpacity style={styles.bottomButton} onPress={this._snap}>
            <AnimatedCircularProgress
              size={100}
              rotation={0}
              width={8}
              fill={this.state.fill}
              tintColor={this.state.color}
              backgroundColor="#3d5875">
              {
                (fill) => (<Text style={{
                  alignItems: 'center',
                  color: "white"
                }}>
                  {this.state.data}</Text>)
              }
            </AnimatedCircularProgress>
            <Text style={{
                alignItems: 'center',
                color: "white"
              }}>{this.state.text}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
          </TouchableOpacity>
        </View>
        {this.renderFaces()}
        {this.renderLandmarks()}
      </Camera>)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between'
  },
  topBar: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  toggleButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomBar: {
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    flex: 0.35,
    flexDirection: 'row',
  },
  bottomButton: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'white'
  },
})
