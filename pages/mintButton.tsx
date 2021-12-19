import React, { Component } from "react";
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface MintButtonProps {
  onClick: () => Promise<boolean | string>;
}

export default class MintButton extends Component<MintButtonProps> {
  startMint = () => {
    toast.promise(
      this.props.onClick(),
        {
          pending: 'Pending...',
          success: '🚀 Hooray! You got something cool! Check your wallet! 🚀',
          error: {
            render({data}){
              return `${data}`
            }
        }
      }
    )
    }


  render() {
    return (
      <div style={{ marginTop: "60px" }}>
        <ToastContainer pauseOnHover={false} autoClose={10000}/>
        <button 
        className="inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
        onClick={() => {this.startMint()}}
        >
          Mint!
          
        </button>
      </div>
    );
  }
}