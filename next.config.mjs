import nextMdx from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: '',
    basePath: '',
    images: {
        unoptimized: true,
    }
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