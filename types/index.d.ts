export type Answer = string

declare module 'claude-code' {
  interface PluginState {
    'last-answer': { answers: Answer[]; offset: number }
  }
}
