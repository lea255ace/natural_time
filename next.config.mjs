import nextMdx from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: '',
    basePath: '',
    images: {
        unoptimized: true,
    },
    // The dev server only allows localhost by default, and blocks the scripts that hydrate the page for other hosts.
    allowedDevOrigins: ['127.0.0.1'],
};

const withMDX = nextMdx({
    options: {
        remarkPlugins: [
            // Turbopack requires plugins to be referenced by name so the loader options are serializable.
            ['remark-smartypants', {
                ellipses: false
            }]
        ]
    }
});

export default withMDX(nextConfig);