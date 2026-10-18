'use client';

import {
    Container,
    Text,
    Heading,
    List,
    VStack,
    Stack
} from '@chakra-ui/react';
import Link from 'components/link';

const outlineStyle = {
    bg: 'white',
    borderWidth: '2px',
    borderRadius: '10px',
    borderColor: 'gray.400',
    p: '4'
};

export default function Home() {
    return (
        <VStack mx='4' my='4'>
            <Heading as='h1' size={{ base: '4xl', md: '5xl' }}>Natural Time</Heading>
            <Stack gap='8' direction={['column', null, 'row']}>
                <Container {...outlineStyle} maxWidth={['430px', null, '500px']}>
                    <Heading as='h3' size='xl' marginTop='0'>About</Heading>
                    <Text>
                        Natural time is an ongoing attempt to re-frame the way I think about time,
                        and to better connect the passage of time with the motion of the Sun, Moon, and stars,
                        from which it was originally derived.
                    </Text>
                    <br />
                    <Text>You can find a more detailed overview on the <Link href='/about'>About page</Link>.</Text>
                </Container>
                <Container {...outlineStyle} maxWidth={['275px']}>
                    <Heading as='h3' size='xl' marginTop='0'>Links</Heading>
                    <Text>Check out the following links to explore the available tools!</Text>
                    <List.Root as='ul' listStylePosition='inside' marginTop='2'>
                        <List.Item><Link href='/dashboard' fontFamily='mono'>Dashboard</Link></List.Item>
                        <List.Item><Link href='/solar_clock' fontFamily='mono'>Solar Clock</Link></List.Item>
                    </List.Root>
                </Container>
            </Stack>
        </VStack>
    );
}
