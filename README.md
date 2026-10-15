# last-answer

A Claude Code mod that keeps the agent's final answers in a side pane, so you can re-read the previous turn's answer without scrolling back past reasoning and tool calls.

- `/last` opens or closes the pane.
- The pane shows the most recent finished answer. While a new turn runs, that is the previous turn's answer.
- **◀ older** / **newer ▶** (hotkeys `o` / `n` while the pane has the keyboard) step through the last 20 answers of the session.
- Subagent reports and empty answers are skipped.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install last-answer --marketplace eduojeda/claude-last-answer
```

Answer `y` to add the marketplace, then pick a scope.

## Development

```
claude plugin validate .
claude plugin test .
```
