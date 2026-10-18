import { Link as ChakraLink, LinkProps } from '@chakra-ui/react';
import NextLink from 'next/link';

// Chakra's Link styled as a Next.js client-side link.
export default function Link({ href, children, ...props }: LinkProps & { href: string }) {
    return (
        <ChakraLink asChild {...props}>
            <NextLink href={href}>{children}</NextLink>
        </ChakraLink>
    );
}
