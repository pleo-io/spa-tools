export type AppConfig = {
    env: 'staging' | 'production' | 'dev'
    version: string
    nested: {
        boi: string
    }
}
