import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/outline'

export const MyTokens: React.FC<{
  tokensOwned: string[],
}> = ({ tokensOwned }) => {

  return (
    <div className='bg-transparent w-full px-12'>
      <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:py-6 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto divide-y-2 divide-gray-200'>
          <div>
            <h2 className='text-center text-2xl font-extrabold text-gray-800 sm:text-3xl'>
              My Tokens
            </h2>
          </div>

          <div className='flex flex-col items-center mt-6'>
            <div className='flex flex-col items-center w-full'>
              <dl className='max-w-3/4 w-full mt-2 space-y-2'>
                {tokensOwned.map(tokenId => (
                  <Link href={`/${tokenId}`}>
                    <div className='flex w-full border-2 border-gray-800 rounded-2xl px-3 py-3 shadow-sm'>
                      <span className='text-center text-xl font-medium text-gray-800 w-full'>
                        {tokenId}
                      </span>
                      <span className='flex items-center'>
                        <ChevronRightIcon
                          className='h-5 ml-1' 
                          aria-hidden='true'
                        />
                      </span>
                    </div>
                  </Link>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
