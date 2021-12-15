import React from 'react'
import Link from 'next/link'
import { InboxIcon, SparklesIcon } from '@heroicons/react/outline'

export function Featured() {
  return (
    <div className='relative bg-white pt-16 pb-32 overflow-hidden'>
      <div className='relative'>
        <div className='lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24'>
          <div className='px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0'>
            <div>
              <div>
                <span className='h-12 w-12 rounded-md flex items-center justify-center bg-indigo-600'>
                  <InboxIcon
                    className='h-6 w-6 text-white'
                    aria-hidden='true'
                  />
                </span>
              </div>
              <div className='mt-6'>
                <h2 className='text-3xl font-extrabold tracking-tight text-gray-900'>
                  Get started in 4 easy steps
                </h2>
                <p className='mt-4 text-lg text-gray-500'>
                  It takes 4 steps and 20min to securitize your will. We walk
                  you through the legal process. Your assets are stored
                  on-chain. Access and manage at any time.
                </p>
                <div className='mt-6'>
                  <Link href='/wills/'>
                    <a
                      href=''
                      className='inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
                    >
                      Get started
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            <div className='mt-8 border-t border-gray-200 pt-6'>
              <blockquote>
                <div>
                  <p className='text-base text-gray-500'>
                    Themis gives me peace and mind knowing I won't lose my
                    assets even in the worst case.
                  </p>
                </div>
                <footer className='mt-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex-shrink-0'>
                      <img
                        className='h-6 w-6 rounded-full'
                        src='https://pbs.twimg.com/profile_images/1323277947613159425/ffWgZTmx_400x400.jpg'
                        alt=''
                      />
                    </div>
                    <div className='text-base font-medium text-gray-700'>
                      Quinn, Crypto Fund Manager
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
          <div className='mt-12 sm:mt-16 lg:mt-0'>
            <div className='pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full'>
              <img
                className='w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none'
                src='/screenshot.png'
                alt='Inbox user interface'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
