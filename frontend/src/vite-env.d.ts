/// <reference types="vite/client" />

declare module '*.jsx' {
    import type { DefineComponent } from 'react'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '*.tsx' {
    import type { DefineComponent } from 'react'
    const component: DefineComponent<{}, {}, any>
    export default component
}
