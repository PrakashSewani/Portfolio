"use client";
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import HomePage from '@/pages/homePage';

export default function Home() {
  return (
    <div className='font-mono'>
      <ChakraProvider>
        <HomePage />
      </ChakraProvider>
    </div>
  );
}
