import dotenv from 'dotenv'
import { NftToken } from 'lib/types';

import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' })

let prisma: PrismaClient;
prisma = new PrismaClient();

// eslint-disable-next-line prettier/prettier
;(async () => {

    const tokensAvailable = await prisma.nftToken.findMany({
        where: { is_minted: false },
        select: { id: true }
    }) as NftToken[]

    console.log("Tokens Available", tokensAvailable)

    const first_token = tokensAvailable[0]
    const full_token = await prisma.nftToken.findUnique({
      where: { id: first_token.id },
      include: {
        attributes: {
          select: { trait_type: true, value: true },
        },
    }
    })
    console.log(full_token)

    prisma.$disconnect();

})()

