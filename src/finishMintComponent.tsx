import React, { Component } from 'react'
import Link from 'next/link'

interface FinishMintProps {
  token_id: string
}

export default class FinishMintComponent extends Component<FinishMintProps> {
  render() {
    return (
      <div style={{ marginTop: '60px' }}>
        <p className='text-xl text-center font-bold px-8 rounded-2xl '>
          <span className='mr-2'>🎉 </span> Congrats! 🎉 <br />
          You just minted your Loonie Token Id: {this.props.token_id}
        </p>

        <Link href={`/${this.props.token_id}`}>
          <a className='inline-flex items-center px-6 py-3 underline text-xl font-bold rounded-2xl text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
            <span className='mr-2'>View your NFT!</span>🚀
          </a>
        </Link>
      </div>
    )
  }
}
