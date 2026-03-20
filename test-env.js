const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
    console.log('--- ENV CHECK ---');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('Prisma connected successfully');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Prisma connection failed:', e.message);
    }

    try {
        const hash = await bcrypt.hash('test', 10);
        const match = await bcrypt.compare('test', hash);
        console.log('Bcrypt test success:', match);
    } catch (e) {
        console.error('Bcrypt test failed:', e.message);
    }
}

test();
