declare module 'mdxld' {
    export interface MDXLD {
        $type?: string;
        $context?: string;
        data?: Record<string, unknown>;
        content: string;
    }
}
