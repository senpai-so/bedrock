import React, { Fragment, useState } from 'react'
import cs from 'classnames'

import ReactMarkdown from 'react-markdown'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'

import { EmptyProps } from 'lib/types'

const faqs = [
  {
    question: 'What are Loonies?',
    answer: `Loonies are a limited edition collection of 10000 NFTs that live in LASA (Loonies Aeronautics and Space Administration). They’re crazy enough to think they can build rocket ships that fly to different chain networks & are going to prove to other NFTs they can. Their first mission is to fly to the Solana metaverse Desolates (desolate.space)`
  },
  {
    question: 'How do I buy a Loonie?',
    answer: `With Luna coins! Follow [this tutorial](/tutorial) to set up a wallet and buy a Luna coin. Then come back here and click on "Connect Wallet" > "Mint" buttons.`
  },
  {
    question: 'How do I set up a wallet to buy?',
    answer: `Install [Terra Station](https://docs.terra.money/Tutorials/Get-started/Terra-Station-desktop.html) and then the [Chrome Extension](https://docs.terra.money/Tutorials/Get-started/Terra-Station-extension.html)`
  },
  {
    question: 'How do I view my NFT?',
    answer: `You'll need to download [Terra Station Desktop](https://docs.terra.money/Tutorials/Get-started/Terra-Station-desktop.html) (extension doesn't support NFTs at the moment). Then, authenticate with your wallet and click on the NFT tab to view your NFT.`
  },
  {
    question: 'How do I stay updated on future drops?',
    answer: `Join our [Discord channel](https://discord.gg/eQRWqApR4A) to stay in the loop and be alerted of future drops 🙌`
  }
]

export const FAQ: React.FC<EmptyProps> = () => {
  return (
    <div className='bg-transparent w-full px-12'>
      <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:py-6 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto divide-y-2 divide-gray-200'>
          <h2 className='text-center text-3xl font-extrabold text-gray-900 sm:text-4xl'>
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
