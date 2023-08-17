# Run multiple concurrent processes

Do you run an application that needs multiple processes? Like `npm run dev` and `npm run tailwind`. Typically in a dev environment you would need to have more than one terminal open if you're running more than on processes. But with batch run you only need one terminal to run all processes concurrently.

## Installation

You can install and run this package directly by running:

```bash
npx batch-run "npm run dev, npm run tailwind"
```

To install this module globally simply run:

```bash
npm install -G batch-run
```

To install this module locally(for just the project) run:

```bash
npm install batch-run
```

_NOTE_: You will have to append `npx` to your command for just a local installation.

## Requirements

For this package to work you need an argument of strings in the terminal command, or a `batchrun.config.json` file at the root of your project directory, which is simply an array of strings, each string being the command to run. Example:

```json
["node index.js", "npm run tailwind"]
```

More entries mean more processes.

# Usage

To fire up the process without a `batchrun.config.json` file simply run:

```bash
batch-run "npm run dev, npm run tailwind"
```

If you did not install the package globally, run:

```bash
npx batch-run "npm run dev, npm run tailwind"
```

If you already have a `batchrun.config.json` file just run

```bash
batch-run
```

# Process actions

When your process is up and running, you can perform a few more actions to your running processes.

### Reload all processes

To reload all processes, while the process is active in your terminal type

```bash
reload
```

Press `Enter` after tyring this. This will reload all the processes you started. Alternatively, you can simply press `Ctrl+R`: this does the same thing. `restart` amd `reboot` commands work also.

### Reload processes

You can also target a single process and reload it. This will need an index appended to the `reload` command. Example:

```bash
- Processes Started ...
...
reload 0
```

This will reload the first command in your list of commands. You can add more indexes by separating them with a comma(,): Example:

```bash
- Processes Started ...
...
reload 0,3,4
```

_NOTE_: Do not add a space between the commands or else the `reload` command won't work.

### Kill processes

To kill all processes simply type:

```bash
- Processes Started ...
...
kill
```

This is the equivalent of pressing `Ctrl+C`. To kill specific processes just follow the same convention as the `reload` command. Example:

```bash
- Processes Started ...
...
kill 1,2
```

To restart a killed process simple use the `reload` command again.
