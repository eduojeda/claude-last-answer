import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const PANE = 'last-answer'
const KEEP = 20
// Newest last. `offset` counts back from the newest: 0 shows the newest.
const answers = atom({ plugin: 'last-answer', key: 'answers' } as const, [])
const offset = atom({ plugin: 'last-answer', key: 'offset' } as const, 0)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'last',
      description: "Open or close the pane with the agent's previous answers",
    })

    return next(e)
  })

  on('command.run', { command: 'last' }, async $ => {
    const isOpen = (await $.ui.panes()).some(pane => pane.id === PANE)
    if (isOpen) {
      await $.ui.close({ id: PANE })
      return { text: 'Previous answer pane closed.' }
    }
    await $.ui.open({ id: PANE, title: 'Previous answer' })
    return { text: 'Previous answer pane opened.' }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && e.answer.trim() !== '') {
      await update($, answers, list => [...list, e.answer].slice(-KEEP))
      await update($, offset, () => 0)
    }

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const list = await read($, answers)
    if (list.length === 0) {
      return <Text dimColor>No answers yet this session.</Text>
    }

    const back = Math.min(await read($, offset), list.length - 1)
    const position = list.length - back

    return (
      <Box flexDirection="column">
        <Box>
          <Text dimColor>{`${position} of ${list.length} `}</Text>
          {back < list.length - 1 && (
            <Button
              key="older"
              label="◀ older"
              hotkey="o"
              onPress={() => update($, offset, n => n + 1)}
            />
          )}
          {back > 0 && (
            <Button
              key="newer"
              label="newer ▶"
              hotkey="n"
              onPress={() => update($, offset, n => n - 1)}
            />
          )}
        </Box>
        <Markdown key="answer" text={list[list.length - 1 - back] ?? ''} />
      </Box>
    )
  })
}
