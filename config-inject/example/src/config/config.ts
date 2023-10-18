export type AppConfig = {
    env: 'staging' | 'production' | 'local'
    version: string
    nested: {
        boi: string
    }
}
