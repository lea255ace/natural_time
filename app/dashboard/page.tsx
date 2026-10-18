'use client';

import Config from 'components/config';
import Clock from 'components/clock';
import { AstrolabeProvider } from 'context/astrolabeProvider';
import { useState, useEffect } from 'react';
import { Stack } from '@chakra-ui/react';

export default function Home() {
    const initialDate = new Date();
    const [currentDate, setCurrentDate] = useState(initialDate);

    // TODO(MW): Could this be pushed down into the Clock component to allow this file to be a server component?
    useEffect(() => {
        const tick = setInterval(() => {
            const currentDate = new Date();
            setCurrentDate(currentDate);
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    return (
        <AstrolabeProvider date={currentDate}>
            <Stack direction={['column', null, null, 'row']} align='center' justifyContent='center' gap='8'
                fontSize={['xs', 'md']}
                marginRight={['0px', null, null, '100px', '200px']}>
                <Clock />
                <Config />
            </Stack>
        </AstrolabeProvider>
    );
}