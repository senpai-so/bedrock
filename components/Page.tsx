import React from 'react'

export const Page: React.FC<{
  title?: string
  subtitle?: string
  currentTabName?: string
}> = ({ title = '', subtitle = '', children }) => {
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
