declare module 'ketcher-standalone' {
    export class StandaloneStructServiceProvider {
        convert(data: string, format: string): Promise<string>;
    }
}

declare module 'ketcher-react' {
    import { FC } from 'react';

    interface EditorProps {
        staticResourcesUrl: string;
        structServiceProvider?: StandaloneStructServiceProvider;
        onInit?: () => void;
        onChange?: (molfile: string) => void;
        initialMolfile?: string;
    }

    export const Editor: FC<EditorProps>;
} 