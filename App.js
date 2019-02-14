import React from 'react';
import { GLView, MediaLibrary, Permissions } from 'expo';
import Expo2DContext from 'expo-2d-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  PanResponder,
  SafeAreaView,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const colors = [
  'black',
  'red',
  'orange',
  'yellow',
  'green',
  'lime',
  'navy',
  'blue',
  'aquamarine',
  'pink',
  'purple',
  'gray',
  'silver',
  'white'
];

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lineWidth: 5,
      strokeStyle: colors[0],
      hasCameraRollPermission: null,
    };

    this._glCanvas = undefined;
    this._ctx = undefined;
    this._prevX = undefined;
    this._prevY = undefined;
    this._panResponder = this._createPanResponder();
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraRollPermission: status === 'granted' });
  }

  drawSegment({x, y, prevX, prevY, strokeStyle, lineWidth}) {
    this._ctx.beginPath();
    this._ctx.moveTo(prevX, prevY);
    this._ctx.lineTo(x, y);
    this._ctx.strokeStyle = strokeStyle;
    this._ctx.lineWidth = lineWidth;
    this._ctx.lineCap = 'round';
    this._ctx.closePath();
    this._ctx.stroke();
    this._ctx.flush();
  }

  _createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX.toFixed(2) * 2;
        const y = evt.nativeEvent.locationY.toFixed(2) * 2;

        if (!this._prevX) this._prevX = x;
        if (!this._prevY) this._prevY = y;
      },
      onPanResponderMove: (evt) => {
        const {strokeStyle, lineWidth} = this.state;
        const x = evt.nativeEvent.locationX.toFixed(2) * 2;
        const y = evt.nativeEvent.locationY.toFixed(2) * 2;

        this.drawSegment({
          x,
          y,
          prevX: this._prevX,
          prevY: this._prevY,
          strokeStyle,
          lineWidth
        });

        this._prevX = x;
        this._prevY = y;
      },
      onPanResponderRelease: () => {
        this._prevX = undefined;
        this._prevY = undefined;
      },
    });
  };

  _onGLContextCreate = (gl) => {
    this._ctx = new Expo2DContext(gl);
  };

  _clearCanvas = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear the canvas?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {
            this._ctx.clearRect(0, 0, this._ctx.width, this._ctx.height);
            this._ctx.flush();
          }
        },
      ],
      {cancelable: false},
    );
  };

  _saveCanvas = async () => {
    const {uri} = await this._glCanvas.takeSnapshotAsync();
    await MediaLibrary.createAssetAsync(uri);

    Alert.alert('', 'Photo has been saved.')
  };

  _updateStrokeStyle = (strokeStyle) => {
    this.setState({strokeStyle});
  };

  _updateLineWidth = (lineWidth) => {
    this.setState({lineWidth: parseFloat(lineWidth)});
  };

  render() {
    const {lineWidth, strokeStyle, hasCameraRollPermission} = this.state;

    return (
      <SafeAreaView style={styles.pageContainer}>
        <View style={styles.buttonContainer}>
          <Text style={styles.headerText}>Drawing Board</Text>
          <Ionicons style={styles.iconButtons} name="ios-trash" size={24} color="black" onPress={this._clearCanvas} />
          {hasCameraRollPermission &&
            <Ionicons style={styles.iconButtons} name="ios-save" size={24} color="black" onPress={this._saveCanvas} />}
        </View>
        <View style={styles.container}>
          <GLView
            ref={(glc) => this._glCanvas = glc}
            {...this._panResponder.panHandlers}
            style={styles.glViewContainer}
            onContextCreate={this._onGLContextCreate}
          />
          <View style={styles.toolsContainer}>
            <Slider
              style={styles.brushWidthSlider}
              step={1}
              minimumTrackTintColor={strokeStyle}
              minimumValue={1}
              maximumValue={50}
              onValueChange={val => this._updateLineWidth(val)}
              value={lineWidth}
            />
            <ScrollView
              horizontal
              contentContainerStyle={styles.center}
              style={styles.colorPickerContainer}
            >
              {colors.map(color => {
                return <TouchableOpacity
                  key={color}
                  onPress={() => this._updateStrokeStyle(color)}
                  style={{
                    backgroundColor: color,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: 'black',
                    width: this.state.strokeStyle === color ? 40 : 30,
                    height: this.state.strokeStyle === color ? 40 : 30,
                    marginLeft: 12,
                    marginRight: 12
                  }}
                />;
              })}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  toolsContainer: {
    width: '100%',
    backgroundColor: 'lightgray'
  },
  colorPickerContainer: {
    flexDirection: 'row',
    height: 50
  },
  iconButtons: {
    padding: 10
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  glViewContainer: {
    width: '100%',
    height: '90%',
    backgroundColor: 'white'
  },
  headerText: {
    marginLeft: 10,
    marginRight: 'auto',
    fontSize: 18
  },
  center: {
    alignItems: 'center',
  },
  pageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'lightgray'
  },
  brushWidthSlider: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
});
