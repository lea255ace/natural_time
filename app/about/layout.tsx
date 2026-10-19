'use client';

import { Breadcrumb } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function SubPageLayout({ children }) {
    return (
        <>
            <Breadcrumb.Root size='lg' bg='gray.300' py='2' paddingLeft='4'>
                <Breadcrumb.List color='gray.800'>
                    <Breadcrumb.Item>
                        {/* NextLink rather than components/link, which would add the purple link recipe styling. */}
                        <Breadcrumb.Link asChild color='gray.800'><NextLink href='/'>Home</NextLink></Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>/</Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color='gray.800'>About</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            {children}
        </>
    );
}
