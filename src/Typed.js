import Typed from 'typed.js';
import React from 'react';

export default class TypedReactDemo extends React.Component {
  componentDidMount() {
    const { strings } = this.props;
    // You can pass other options here, such as typing speed, back speed, etc.
    const options = {
    	strings: strings,
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 900,
      loop: false,
      loopCount: Infinity,
    };
    // this.el refers to the <span> in the render() method
    this.typed = new Typed(this.el, options);
    this.typed.start()

  }

  componentWillUnmount() {
    this.typed.destroy();
  }

  render() {
    return (
      <div className="wrap">
        <div className="type-wrap">
          <span
            style={{ whiteSpace: 'pre', fontSize: '24px', color:'#f85032' }}
            ref={(el) => { this.el = el; }}
          />
        </div>

      </div>
    );
  }
}
