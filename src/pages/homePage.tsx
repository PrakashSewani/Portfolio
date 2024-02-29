import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Image } from "@chakra-ui/react";
import React from "react";
import myPhotu from '../assets/myPhotu.png';

export default function HomePage() {
    return <>
        <div className="bg-gradient-to-t from-[#00E6F6] via-[#172F39] to-[#20242D] h-screen flex items-center justify-center">
            <div className="bg-[#20242D] rounded-xl h-4/5 w-2/3 shadow-2xl">
                <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
                        <nav>
                            <Button variant={"outline"} colorScheme={"teal"} className="mr-2">Home</Button>
                            <Button variant={"ghost"} colorScheme={"teal"} className="mr-2">Skills</Button>
                            <Button variant={"ghost"} colorScheme={"teal"}>Contact</Button>
                        </nav>
                    </div>
                    <div className="flex items-center justify-around p-16">
                        <div className="flex flex-col items-center justify-center w-4/5">
                            <p className="text-4xl relative w-[max-content] before:absolute before:inset-0 before:animate-typewriter before:bg-[#20242D] after:absolute after:inset-0 after:w-[0.125em] after:animate-caret after:bg-white animate-pulse text-white mb-5">Hello, I am Prakash Sewani</p>
                            <span className="text-lg text-gray-500 text-white text-justify mb-5">
                                Welcome to my portfolio! Here, I showcase my skills in coding, passion for gaming, and knack for creative problem-solving.
                                Take a look at my projects to see how I turn challenges into opportunities, blending code and creativity seamlessly.
                                Each piece reflects my dedication to coding, gaming, and strategic problem-solving.
                            </span>
                            <div className="flex space-x-4 mt-4">
                                <Button colorScheme={"teal"} variant={"solid"}>Download CV</Button>
                                <Button rightIcon={<ExternalLinkIcon />} colorScheme={"teal"} variant={"outline"}>Projects</Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-4/5">
                            <div className="h-96 w-96 bg-white rounded-md rotate-[348deg]">
                                <div className="w-96 h-96 bg-[#10626E] rounded-md relative rotate-12">
                                    <Image boxSize={"600px"} objectFit={"cover"} src={myPhotu.src} alt="Avatar" className="w-full h-full rounded-xl absolute bottom-0 right-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <p className="text-sm text-white">© 2024 Prakash Sewani</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-sm text-white">Privacy Policy</a>
                            <a href="#" className="text-sm text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
}