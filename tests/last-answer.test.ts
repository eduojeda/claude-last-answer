import { expect, test } from 'claude-code/testing'

const PANE = {
  title: 'Previous answer',
  isFocused: false,
  bodyColumns: 60,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 30 },
  view: {},
} as const

const answer = (text: string, agentId?: string) => ({
  answer: text,
  durationMs: 1,
  isAborted: false,
  turnId: text,
  reason: 'answer' as const,
  ...(agentId === undefined ? {} : { agentId }),
})

test('shows main-loop answers and steps back through them', async ($, on) => {
  on('turn.complete', (_$, e) => ({ text: e.answer }))

  await $.turn.complete(answer('first answer'))
  await $.turn.complete(answer('subagent report', 'agent-1'))
  await $.turn.complete(answer('second answer'))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'last-answer',
      surface,
      component: 'Pane',
      requestId: 'last-answer',
      props: PANE,
    })
    const shown = async () => JSON.stringify(await ui.drawn())

    expect(await shown()).toContain('second answer')
    expect(await shown()).toContain('2 of 2')
    expect(await shown()).not.toContain('subagent report')

    await ui.press({ key: 'older' })
    expect(await shown()).toContain('first answer')
    expect(await ui.find({ key: 'older' })).toBeUndefined()

    await ui.press({ key: 'newer' })
    expect(await shown()).toContain('second answer')
    await ui.unmount()
  }
})
