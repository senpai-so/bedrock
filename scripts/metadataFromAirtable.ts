import dotenv from 'dotenv'

import Airtable from 'airtable'
import { Attachment } from 'airtable'
import { AirtableBase } from 'airtable/lib/airtable_base'
import prisma from '../lib/prisma';

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
          const token_id = record.fields['token_id'] as string
          const name = record.fields['name'] as string
          const description = record.fields['description'] ? record.fields['description'] as string : ""
          const image = record.fields["image (auto-filled; don't need to fill)"] as Attachment[]
          const image_url = image ? image[0]['url'] : "No image url found"
          // const traits = record.fields['traits'] as string
          //TODO: Account for duplicates
          await prisma.nftTokens.create({
            data: {
              token_id: token_id,
              name: name,
              description: description,
              extension_name: name,
              image_uri: image_url,
              extension_image: image_url,
            },
          })
        })

        fetchNextPage()
      },
      (err: Error) => {
        if (err) console.error(err)
      }
    )


})()
