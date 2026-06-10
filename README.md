# hacktype

A typing speed test where you are the hacker in a movie.

Instead of typing random words, you type the command lines of fake terminal sessions: ssh into ghost servers, scan ports, decrypt payloads. You type the commands, press enter, and the machine answers itself. The output prints instantly, just like in the films, and the next prompt is already waiting for you.

60 seconds. How many lines can you clear before the trace completes?

**Play it here: [hacktype.pro](https://hacktype.pro)**

Free, open source, no accounts, no backend. If you enjoy it, you can [buy me a coffee](https://ko-fi.com/devinprogress).

## How it works

Everything in hacktype is theater. None of the commands are real attacks, the IPs are fake, the hostnames do not exist. What is real is your typing speed.

The whole game is built on one tiny data shape:

```ts
interface ISessionLine {
  prompt: string; // "$ " means you type this line, "" means it is output
  text: string;
}
```

A session script is just an array of these lines. Lines with a `$ ` prompt are commands, and those are the ones you type. Lines with an empty prompt are output, and the game skips past them automatically:

```ts
while (next < lines.length && lines[next].prompt === "") next += 1;
```

That one loop is the movie magic. You commit a command with enter, the index jumps over all the output lines at once, and they appear on screen together with the next prompt. The machine answers itself, you type the commands.

A few other details that make it feel like a terminal and not a form:

- There is no input element. The terminal card itself receives keyboard focus and listens for keydown events. Before you click it, an overlay says "click to jack in\_".
- Future lines are simply not rendered until you reach them, so the session reveals itself progressively. Completed lines fade out behind you.
- When a script ends, the next one is appended to the same scrollback. The terminal never clears, it just keeps scrolling like a long night of work.
- The cursor is not a separate element. The next character you need to type gets a CSS class, and the blinking bar is drawn on it with a pseudo-element.

## Stats

- Breach score is the game's own number: your wpm scaled by accuracy squared. Type fast and clean and it stays near your wpm; get sloppy and it sinks. It comes with a cozy clearance rank, climbing from sleepy port to ghost kernel, with void walker waiting past 100.
- WPM is calculated the standard way: correct characters divided by 5, divided by elapsed minutes. The enter that commits each line counts as a character, just like the space between words in a normal typing test.
- Accuracy is correct characters over total typed characters.
- Lines cleared counts only the commands you actually typed. The machine does not get credit for its own output.
- At the end you get a trace probability, which is pure flavor: the faster you type, the cleaner you got out.

Your last 20 results are kept in localStorage and shown as a small bar chart below the terminal. Nothing ever leaves your browser.

## Themes

Two terminals to choose from on first visit:

- **cozy hacker**: charcoal plum background, dusty pink accent, JetBrains Mono. Quiet and soft, no glow, no scanlines. The signature look.
- **textbook hacker**: green phosphor on true black, VT323 font, subtle glow and scanlines. The terminal every movie promised you.

Themes are just sets of CSS custom properties swapped via a `data-theme` attribute on the root element. Components only ever reference the variables, never raw colors, so adding a theme means writing one CSS file and one registry entry.

## Tech

- React 18 + TypeScript + Vite
- CSS Modules, no UI libraries
- localStorage for persistence, no backend of any kind
- Zero runtime dependencies beyond React

## Running locally

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
npm run preview
```

## Project structure

```
src/
  constants.ts            all magic values in one place
  types.ts                shared interfaces and type aliases
  data/sessions.ts        the session script library
  themes/                 theme registry + one CSS file per theme
  hooks/
    useTypingEngine.ts    the game brain: typing state, timer, scoring
    useTheme.ts           theme choice + persistence
    useHistory.ts         WPM history persistence
  utils/
    storage.ts            safe localStorage wrapper
    wpm.ts                pure stat functions
  components/             one folder per component, logic-light by design
```

The architecture in one sentence: `useTypingEngine` owns all game state, and the components just render whatever it tells them.

## Writing your own sessions

The easiest way to contribute is adding session scripts to `src/data/sessions.ts`. The style guide:

- 7 to 9 lines, a mix of commands and output
- Each session tells a tiny story: connect, act, succeed
- Lowercase except things that are naturally caps, like [OK] or ACCESS GRANTED
- Realistic flavor: fake IPs, ports, hex strings, flags like --silent, ascii progress bars like [####----]
- Every character must be typeable on a standard keyboard
- Keep lines under about 45 characters so nothing wraps
- Nothing that is an actual working attack. Fake hostnames only (target.local, darknet.relay.onion)

Tag your session with a mode (`intrusion`, `network`, or `system`) and it shows up in that tab.

## Contributing

Issues and pull requests are welcome. Keep it small and focused, match the existing code style (CSS Modules, named exports, types in `types.ts`, constants in `constants.ts`), and check that it still looks right at 360px wide.

## License

MIT. Built by [@diffVariable](https://github.com/diffVariable). Open source, free forever.
