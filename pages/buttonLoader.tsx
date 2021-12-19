import React, { Component } from "react";
import { SpinningCircles } from 'react-loading-icons'

interface ButtonLoaderProps {
  buttonText: string;
  onClick: () => void;
}

export default class ButtonLoader extends Component<ButtonLoaderProps> {
  state = {
    loading: false
  };
  
  startOnClick() {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
    this.props.onClick();
  }

  render() {
    const { loading } = this.state;

    return (
      <div style={{ marginTop: "60px" }}>
        <button 
        className="inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
        onClick={() => {this.startOnClick()}}
        >
          {loading ? <SpinningCircles stroke="#98ff98"/> : this.props.buttonText}
        </button>
      </div>
    );
  }
}