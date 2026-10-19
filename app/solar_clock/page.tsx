'use client';

import {
    Box,
    Center,
    Flex,
    Heading,
    Slider,
    Text,
    VStack,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import Clock from 'components/clock';
import { AstrolabeProvider } from 'context/astrolabeProvider';
import { useConfigContext } from 'context/configProvider';
import { zonedDate, zonedParts } from 'types/timeZone';
import { useState } from 'react';
import * as Complications from 'components/complications';

function ComplicationDisplay() {
    const complicationsList = [
        Complications.EqTime,
        Complications.DaylightSavings,
    ];

    return (
        <Wrap>
            {complicationsList.map((Complication, index) => {
                return (
                    <WrapItem key={index}>
                        <VStack>
                            <Center height='200px' width='fit-content' borderWidth='1px' borderColor='gray.400' borderRadius='5px'>
                                < Complication.Display />
                            </Center>
                            <Text fontWeight='bold'>
                                {Complication.Title}
                            </Text>
                        </VStack>

                    </WrapItem>
                );
            })}
        </Wrap>
    );
}

export default function SolarClock() {
    //TODO(MW): Push these down into client components
    const [currentDay, setCurrentDay] = useState(50);
    const [currentTimeMinutes, setCurrentTimeMinutes] = useState(720);

    // The sliders pick a civil day and time at the configured location, in the current year there.
    const { timeZone } = useConfigContext();
    const year = zonedParts(new Date(), timeZone).year;
    const date = zonedDate(timeZone, year, 1, 1 + currentDay,
        Math.floor(currentTimeMinutes / 60), currentTimeMinutes % 60);

    return (
        <AstrolabeProvider date={date}>
            <Box width='100%' px='5%' marginTop='2em'>
                <Slider.Root
                    colorPalette='blue'
                    size='sm'
                    id="currentDay"
                    defaultValue={[50]}
                    min={0}
                    max={364}
                    onValueChange={(details) => setCurrentDay(details.value[0])}
                >
                    <Slider.Control>
                        <Slider.Track>
                            <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumbs />
                    </Slider.Control>
                </Slider.Root>
                <Text fontWeight='bold' marginBottom='1.5em'>Day of Year</Text>
                <Slider.Root
                    colorPalette='blue'
                    size='sm'
                    id="currentTime"
                    defaultValue={[720]}
                    min={0}
                    max={1440 - 1}
                    onValueChange={(details) => setCurrentTimeMinutes(details.value[0])}
                >
                    <Slider.Control>
                        <Slider.Track>
                            <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumbs />
                    </Slider.Control>
                </Slider.Root>
                <Text fontWeight='bold'>Time of Day</Text>
            </Box>
            <Flex gap='2'>
                <Box minWidth='500px' flex='1'>
                    <Clock />
                </Box>
                <VStack align='start' flex='1'>
                    <Heading as='h2' size={{ base: '2xl', md: '3xl' }}>Complications</Heading>
                    <ComplicationDisplay />
                </VStack>
            </Flex>
        </AstrolabeProvider>
    );
}