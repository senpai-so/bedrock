import React from 'react'

export const Mint: React.FC<{
  disabled: boolean,
  mintCallback: (count: number) => Promise<void>,
  mintCost: number,
  tokensMinted: number,
  tokenSupply: number,
}> = ({ disabled, mintCallback, mintCost, tokensMinted, tokenSupply }) => {
  const [mintCount, setMintCount] = React.useState<number | undefined>()

  const updateMintCount = (value: number | undefined) => {
    if (typeof value === 'undefined') return;
    if (value < 1) {
      setMintCount(1)
    } else if (value > (tokenSupply-tokensMinted)) {
      setMintCount(tokenSupply-tokensMinted)
    } else {
      setMintCount(value)
    }
  }

  return (
    <div className='bg-transparent w-full px-12'>
      <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:py-6 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto  divide-gray-200'>
          <div>
            <h2 className='text-center text-2xl font-extrabold text-gray-800 sm:text-3xl'>
              Mint NFT
            </h2>
            <h3 className='text-center text-l font-bold text-gray-700 sm:text-xl mt-2'>
              { `${tokensMinted} / ${tokenSupply}` }
            </h3>
          </div>

          <div className='flex flex-col items-center mt-6 space-y-6 '>
            {/* <div className='flex flex-col items-center'>
              <input
                type='number'
                name='count'
                placeholder='Quantity'
                value={mintCount}
                className='flex items-center mt-6 px-6 py-3 border-2 border-blue-500 text-l font-medium rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onChange={(e) => updateMintCount(parseInt(e.currentTarget.value))}
              /> 
              
            </div> */}
            <button
              className='flex items-center mt-2 px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              onClick={() => mintCallback(mintCount || 1)}
              disabled={disabled}
            >
              {`Mint!`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
