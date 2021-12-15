import React from 'react'
import cs from 'classnames'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'

const user = {
  name: 'Jim Zheng',
  email: 'jim@senpai.so',
  imageUrl:
    'https://pbs.twimg.com/profile_images/1016118554809077761/aEp8QNIR_400x400.jpg'
}
const navigation = [
  { name: 'Assets', href: '/assets/' },
  { name: 'Wills', href: '/wills/' },
  { name: 'Create', href: '/wills/steps' }
]
const userNavigation = [
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' }
]

export const Dashboard: React.FC<{
  title?: string
  subtitle?: string
  currentTabName?: string
}> = ({ title = '', subtitle = '', currentTabName = 'Assets', children }) => {
  return (
    <>
      <div className='min-h-full'>
        <div className='pb-32'>
          <header className='py-10'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <h1 className='text-3xl font-bold text-white'>
                {title} &rsaquo; {subtitle}{' '}
              </h1>
            </div>
          </header>
        </div>

        <main className='-mt-32'>
          <div className='max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8'>
            {children}
            {/* Replace with your content */}
            {/* /End replace */}
          </div>
        </main>
      </div>
    </>
  )
}
