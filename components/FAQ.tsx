import React, { Fragment, useState } from 'react'
import cs from 'classnames'

import ReactMarkdown from 'react-markdown'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'

import { EmptyProps } from 'lib/types'
import { faqs } from '../public/frontend-config.json'


export const FAQ: React.FC<EmptyProps> = () => {
  return (
    <div className='bg-transparent w-full px-12'>
      <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:py-6 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto divide-y-2 divide-gray-200'>
          <h2 className='text-center text-2xl font-extrabold text-gray-800 sm:text-3xl'>
            FAQ
          </h2>

          <dl className='mt-6 space-y-6 divide-y divide-gray-200'>
            {faqs.map((faq) => (
              <Disclosure as='div' key={faq.question} className='pt-6'>
                {({ open }) => (
                  <>
                    <dt className='text-lg'>
                      <Disclosure.Button className='text-left w-full flex justify-between items-start text-gray-400'>
                        <span className='font-medium text-gray-900'>
                          {faq.question}
                        </span>
                        <span className='ml-6 h-7 flex items-center'>
                          <ChevronDownIcon
                            className={cs(
                              open ? '-rotate-180' : 'rotate-0',
                              'h-6 w-6 transform'
                            )}
                            aria-hidden='true'
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as='dd' className='mt-2'>
                      <p className={cs('text-base', 'markdown-container')}>
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
                      </p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>

      <style global jsx>{`
        .markdown-container a {
          color: blue;
        }
      `}</style>
    </div>
  )
}
