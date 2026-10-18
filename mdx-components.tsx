import type { MDXComponents } from 'mdx/types';
import { Heading, Text } from '@chakra-ui/react';
import Link from 'components/link';

const customComponents = {
    h1: ({children}) => <Heading as="h1" size={{ base: '4xl', md: '5xl' }}>{children}</Heading>,
    h2: ({children}) => <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>{children}</Heading>,
    p: ({children}) => <Text marginBottom='4'>{children}</Text>,
    a: ({href, children}) => <Link href={href} >{children}</Link>,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        ...customComponents
    };
}
