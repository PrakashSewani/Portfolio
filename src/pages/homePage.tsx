import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import React from "react";

export default function HomePage() {
    return <>
        <div className="bg-gradient-to-r from-[#22C35E] to-[#01837F]gig h-screen flex items-center justify-center">
            <div className="bg-white rounded-xl h-4/5 w-2/3 shadow-2xl">
                <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-2xl font-bold">Portfolio</h1>
                        <nav>
                            <Button variant={"ghost"} colorScheme={"whatsapp"} className="text-white px-4 py-2 rounded-lg mr-2">Home</Button>
                            <Button variant={"ghost"} className="text-white px-4 py-2 rounded-lg mr-2">Skills</Button>
                            <Button variant={"ghost"} className="text-white px-4 py-2 rounded-lg">Contact</Button>
                        </nav>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center w-4/5">
                            <h1 className="text-4xl font-bold">Hello, I'm Prakash Sewani</h1>
                            <p className="text-lg text-gray-500">I'm a full stack web developer and a competitive programmer</p>
                            <div className="flex space-x-4 mt-4">
                                <Button colorScheme={"whatsapp"} variant={"solid"}>Download CV</Button>
                                <Button rightIcon={<ExternalLinkIcon />} colorScheme={"whatsapp"} variant={"outline"}>Projects</Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-4/5">
                            <div className="h-96 w-96 bg-[#01837F] rounded-xl rotate-[356]">
                                <div className="w-96 h-96 bg-[#22C35E] rotate-12 rounded-xl">
                                    <img src="https://www.w3schools.com/w3images/avatar2.png" alt="Avatar" className="w-full h-full rotate-[348deg] rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <p className="text-sm">© 2024 Prakash Sewani</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-sm">Privacy Policy</a>
                            <a href="#" className="text-sm">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
}