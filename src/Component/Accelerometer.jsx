import React, { Component } from 'react';

class Accelerometer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moApi: '',
      moAccel: { x: 0, y: 0, z: 0 },
      moAccelGrav: { x: 0, y: 0, z: 0 },
      moRotation: { x: 0, y: 0, z: 0 },
      moInterval: 0
    };
  }
  componentDidMount() {
    if (
      this.isMobileDevice() &&
      'LinearAccelerationSensor' in window &&
      'Gyroscope' in window
    ) {
      this.setState({ moApi: 'Generic Sensor API' });
      let accelerometer = new window.LinearAccelerationSensor();
      let lastReadingTimestamp;
      accelerometer.addEventListener('reading', e => {
        if (lastReadingTimestamp) {
          this.intervalHandler(
            Math.round(accelerometer.timestamp - lastReadingTimestamp)
          );
        }
        lastReadingTimestamp = accelerometer.timestamp;
        this.accelerationHandler(accelerometer, 'moAccel');
      });
      accelerometer.start();

      if ('GravitySensor' in window) {
        let gravity = new window.GravitySensor();
        gravity.addEventListener('reading', e =>
          this.accelerationHandler(gravity, 'moAccelGrav')
        );
        gravity.start();
      }

      let gyroscope = new window.Gyroscope();
      gyroscope.addEventListener('reading', e =>
        this.rotationHandler({
          alpha: gyroscope.x,
          beta: gyroscope.y,
          gamma: gyroscope.z
        })
      );
      gyroscope.start();
    } else if (this.isMobileDevice() && 'DeviceMotionEvent' in window) {
      this.setState({ moApi: 'Device Motion API' });
      window.addEventListener('devicemotion', this.onDeviceMotion, false);
    } else {
      this.setState({ moApi: 'No Accelerometer & Gyroscope API available' });
    }
  }
  onDeviceMotion = eventData => {
    this.accelerationHandler(eventData.acceleration, 'moAccel');
    this.accelerationHandler(
      eventData.accelerationIncludingGravity,
      'moAccelGrav'
    );
    this.rotationHandler(eventData.rotationRate);
    this.intervalHandler(eventData.interval);
  };
  accelerationHandler = (acceleration, targetId) => {
    this.setState({
      [targetId]: {
        x: acceleration.x && acceleration.x.toFixed(3),
        y: acceleration.y && acceleration.y.toFixed(3),
        z: acceleration.z && acceleration.z.toFixed(3)
      }
    });
  };
  rotationHandler = rotation => {
    this.setState({
      moRotation: {
        x: rotation.alpha && rotation.alpha.toFixed(3),
        y: rotation.beta && rotation.beta.toFixed(3),
        z: rotation.gamma && rotation.gamma.toFixed(3)
      }
    });
  };
  intervalHandler = interval => {
    this.setState({ moInterval: interval });
  };
  isMobileDevice = () => {
    return (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    );
  };
  render() {
    const { moApi, moAccel, moAccelGrav, moRotation, moInterval } = this.state;
    return (
      <div>
        <table className='table table-striped table-bordered'>
          <tbody>
            <tr>
              <td>API used</td>
              <td>{moApi}</td>
            </tr>
            <tr>
              <td>linear acceleration (excl. gravity)</td>
              <td>
                X : {moAccel.x} | Y : {moAccel.y} | Z : {moAccel.z}
              </td>
            </tr>
            <tr>
              <td>acceleration incl. gravity</td>
              <td>
                X : {moAccelGrav.x} | Y : {moAccelGrav.y} | Z : {moAccelGrav.z}{' '}
              </td>
            </tr>
            <tr>
              <td>rotation rate</td>
              <td>
                X : {moRotation.x} | Y : {moRotation.y} | Z : {moRotation.z}
              </td>
            </tr>
            <tr>
              <td>interval (ms)</td>
              <td>{moInterval}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Accelerometer;
