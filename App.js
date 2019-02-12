import React from 'react';
import { GLView } from 'expo';
import Expo2DContext from 'expo-2d-context';
import { StyleSheet, View, PanResponder } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lineWidth: 5,
      strokeStyle: 'black'
    };

    this._ctx = undefined;
    this._prevX = undefined;
    this._prevY = undefined;
    this._panResponder = this._createPanResponder();
  }

  _createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        const {x0, y0} = gestureState;

        if (!this._prevX) this._prevX = x0 * 2;
        if (!this._prevY) this._prevY = y0 * 2;
      },
      onPanResponderMove: (evt, gestureState) => {
        const {moveX, moveY} = gestureState;
        const x = moveX * 2;
        const y = moveY * 2;

        const xDiff = Math.abs(x - this._prevX);
        const yDiff = Math.abs(y - this._prevY);

        if (xDiff >= .5 || yDiff >= .5) {
          this._ctx.beginPath();
          this._ctx.moveTo(this._prevX, this._prevY);
          this._ctx.lineTo(x, y);
          this._ctx.strokeStyle = this.state.strokeStyle;
          this._ctx.lineWidth = this.state.lineWidth;
          this._ctx.stroke();
          this._ctx.closePath();
          this._ctx.flush();

          this._prevX = x;
          this._prevY = y;
        }
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

  render() {
    return (
      <View style={styles.container}>
        <GLView
          {...this._panResponder.panHandlers}
          style={styles.glViewContainer}
          onContextCreate={this._onGLContextCreate}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  glViewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  }
});
