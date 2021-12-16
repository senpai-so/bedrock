import dotenv from 'dotenv'

import Airtable from 'airtable'
import { Attachment } from 'airtable'
import { AirtableBase } from 'airtable/lib/airtable_base'

dotenv.config({ path: '.env.local' })

function getAirtableClient(baseId: string): AirtableBase {
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_API_KEY
  })
  const base = Airtable.base(baseId)
  return base
}

// eslint-disable-next-line prettier/prettier
; (async (connection) => {
  console.log('Connecting to Airtable')

  // Keeping in here as it's not rly a secret
  const looniesMetadataAirtableId = 'appn2XbAF0nNuS6de'
  const base = getAirtableClient(looniesMetadataAirtableId)

  await base('Table 1')
    .select({
      pageSize: 3,
      view: 'Grid view'
    })
    .eachPage(
      async (records, fetchNextPage) => {
        records.forEach(async (record) => {
          const tokenId = record.fields['token_id'] as string
          const name = record.fields['name'] as string
          const images = record.fields['image'] as Attachment[]
          // ...
        })

        fetchNextPage()
      },
      (err: Error) => {
        if (err) console.error(err)
      }
    )
})()
