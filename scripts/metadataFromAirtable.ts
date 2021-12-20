import dotenv from 'dotenv'

import Airtable from 'airtable'
import { Attachment } from 'airtable'
import { AirtableBase } from 'airtable/lib/airtable_base'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: '.env.local' })

interface TraitRecordInput {
  id?: number
  trait_type: string
  value: string
}

function createTraitRecord(config: TraitRecordInput): {
  trait_type: string
  value: string
} {
  return {
    trait_type: config.trait_type || '',
    value: config.value || ''
  }
}

interface TraitCreateManyEnvelope {
  data: Array<TraitRecordInput>
  skipDuplicates?: boolean
}

function createTraitCreateManyEnvelope(config: TraitCreateManyEnvelope): {
  data: Array<TraitRecordInput>
  skipDuplicates: boolean
} {
  return {
    data: config.data || [],
    skipDuplicates: config.skipDuplicates || true
  }
}

function generateTraitsListFromAirtableRecord(
  traits: Map<string, Array<string>>
) {
  let attributes_data: Array<TraitRecordInput> = []
  traits.forEach((value: Array<string>, key: string) => {
    if (value) {
      for (let i = 0; i < value.length; i++) {
        attributes_data.push(
          createTraitRecord({ trait_type: key, value: value[i] })
        )
      }
    }
  })

  let envelope = createTraitCreateManyEnvelope({
    data: attributes_data,
    skipDuplicates: true
  }) as TraitCreateManyEnvelope

  return envelope
}

function getAirtableClient(baseId: string): AirtableBase {
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_API_KEY
  })
  const base = Airtable.base(baseId)
  return base
}

;(async (connection) => {
  console.log('Connecting to Airtable')

  const prisma = new PrismaClient()

  // Keeping in here as it's not rly a secret
  const looniesMetadataAirtableId = 'appn2XbAF0nNuS6de'
  const base = getAirtableClient(looniesMetadataAirtableId)

  base('Table 1')
    .select({
      pageSize: 3,
      view: 'Grid view'
    })
    .eachPage(
      async (records, fetchNextPage) => {
        records.forEach(async (record) => {
          const token_id = record.fields['token_id'] as string
          const name = record.fields['name'] as string
          const description = record.fields['description']
            ? (record.fields['description'] as string)
            : ''
          const image = record.fields[
            "image (auto-filled; don't need to fill)"
          ] as Attachment[]
          const image_url = image ? image[0]['url'] : 'No image url found'

          let traits = new Map<string, Array<string>>()
          traits.set('Background', record.fields['Background'] as Array<string>)
          traits.set('Body', record.fields['Body'] as Array<string>)
          traits.set('Eyes', record.fields['Eyes'] as Array<string>)
          traits.set('Mouth', record.fields['Mouth'] as Array<string>)
          traits.set('Headwear', record.fields['Headwear'] as Array<string>)
          traits.set('Outfit', record.fields['Outfit'] as Array<string>)
          if (traits) {
            let allTraitsOfToken = generateTraitsListFromAirtableRecord(traits)
            console.log(name)
            console.log(allTraitsOfToken)
            await prisma.nftToken.create({
              data: {
                token_id: token_id,
                name: name,
                description: description,
                attributes: {
                  createMany: allTraitsOfToken
                },
                image_uri: image_url
              }
            })
          } else {
            await prisma.nftToken.create({
              data: {
                token_id: token_id,
                name: name,
                description: description,
                image_uri: image_url
              }
            })
          }
        })

        fetchNextPage()
      },
      (err: Error) => {
        if (err) console.error(err)
      }
    )
  prisma.$disconnect()
})()
