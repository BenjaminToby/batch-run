#! /usr/bin/env node
// @ts-check

const fs = require("fs");
const path = require("path");
const { spawn, ChildProcess, execSync } = require("child_process");
const readline = require("readline");
const colors = require("./console-colors");

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

/** @type {string[]} */
const processesStrings = [];

/** @type {ChildProcess[]} */
let processes = [];

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Listen for user input
rl.on("line", (input) => {
    if (input?.match(/^(reload|restart|reboot)$/i)) {
        console.log(` - ${colors.FgBlue}Reloading processes ...${colors.Reset}`);
        restartAll();
    } else if (input?.match(/^(reload|restart|reboot) \d/i)) {
        const processedIndexesString = input.split(" ")[1];
        const processedIndexes = processedIndexesString ? processedIndexesString.split(",") : null;

        if (!processedIndexes?.length) {
            console.log(` - ${colors.FgRed}Error:${colors.Reset} No processes to reload`);
            return;
        } else {
            console.log(` - ${colors.FgBlue}Reloading processes ${processedIndexesString} ...${colors.Reset}`);
            processedIndexes.forEach((index) => {
                restartOne(index);
            });
            console.log(` - ${colors.FgGreen}Processes Restarted Successfully ${processedIndexesString} ...${colors.Reset}`);
        }
    }

    if (input?.match(/^kill$/i)) {
        console.log(` - ${colors.FgYellow}Killing processes ...${colors.Reset}`);
        process.exit();
    } else if (input?.match(/^kill \d/i)) {
        const processedIndexesString = input.split(" ")[1];
        const processedIndexes = processedIndexesString ? processedIndexesString.split(",") : null;

        if (!processedIndexes?.length) {
            console.log(` - ${colors.FgRed}Error:${colors.Reset} No processes to reload`);
            return;
        } else {
            console.log(` - ${colors.FgYellow}Killing processes ${processedIndexesString} ...${colors.Reset}`);
            processedIndexes.forEach((index) => {
                killOne(index);
            });

            console.log(` - ${colors.FgGreen}Processes Killed ${processedIndexesString} ...${colors.Reset}`);
        }
    }
});

process.stdin.on("keypress", (character, key) => {
    if (key.ctrl && key.name === "r") {
        console.log(` - ${colors.FgBlue}Reloading processes ...${colors.Reset}`);
        restartAll();
    }
});

process.on("exit", (code) => {
    console.log(` - ${colors.FgBlue}Process exited with code ${code}${colors.Reset}`);
    rl.close();
});

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

const argvProcessListIndex = process.argv.indexOf("batch-run") + 1;
const argvProcessList = process.argv.at(-1);

const processesFilePath = path.resolve(process.cwd(), "batchrun.config.json");

if (fs.existsSync(processesFilePath)) {
    const processesFile = fs.readFileSync(processesFilePath, "utf8");
    const processesArray = JSON.parse(processesFile);
    for (let i = 0; i < processesArray.length; i++) {
        const processString = processesArray[i];
        const strippedProcessString = processString.trim();
        processesStrings.push(strippedProcessString);
    }
} else if (argvProcessList) {
    const processesArray = argvProcessList.split(",");
    for (let i = 0; i < processesArray.length; i++) {
        const processString = processesArray[i];
        const strippedProcessString = processString.trim();
        processesStrings.push(strippedProcessString);
    }
} else {
    console.error(` - ${colors.FgRed}Error:${colors.Reset} No arguments to run or \`batchrun.config.json\` file present`);
    process.exit(1);
}

if (!processesStrings?.[0]) {
    console.error(` - ${colors.FgRed}Error:${colors.Reset} No processes to run`);
    process.exit(1);
}

/** @type {import("child_process").SpawnOptions} */
const spawnOptions = {
    cwd: process.cwd(),
    shell: process.platform.match(/win/i) ? "bash.exe" : undefined,
    stdio: "inherit",
};

/**
 * Start all processes
 */
function startProcesses() {
    for (let i = 0; i < processesStrings.length; i++) {
        const processString = processesStrings[i];
        const processStringArray = processString.split(" ");
        const targetProcess = processStringArray.shift();
        if (targetProcess) {
            const process = spawn(targetProcess, processStringArray, spawnOptions);
            processes.push(process);
        } else {
            console.error(` - ${colors.FgRed}Error:${colors.Reset} A target process is not defined in \`${processString}\``);
            process.exit(1);
        }
    }
}

/**
 * Restart All Processes
 */
function restartAll() {
    for (let i = 0; i < processes.length; i++) {
        const childProcess = processes[i];

        try {
            if (childProcess.pid) killProcessForce(childProcess.pid);
            childProcess.kill();
            // processes.splice(i, 1);
        } catch (error) {
            console.log(` - ${colors.FgRed}Error:${colors.Reset} Failed to kill process ${childProcess.pid}`);
            process.exit();
        }
    }

    console.log(` - ${colors.FgGreen}Restarted ${processes.length} processes${colors.Reset}`);

    processes = [];

    setTimeout(() => {
        startProcesses();
    }, 500);
}

/**
 * Restart a single process
 * @param {string} index
 */
function restartOne(index) {
    const childProcess = processes[parseInt(index)];

    try {
        if (childProcess.pid) killProcessForce(childProcess.pid);
        childProcess.kill();
    } catch (error) {
        console.log(` - ${colors.FgRed}Error:${colors.Reset} Failed to kill process ${childProcess.pid}`);
        process.exit();
    }

    const processString = processesStrings[index];
    const processStringArray = processString.split(" ");
    const targetProcess = processStringArray.shift();
    const newChildProcess = spawn(targetProcess, processStringArray, spawnOptions);
    processes.splice(parseInt(index), 1, newChildProcess);
}

/**
 * Kill a single process
 * @param {string} index
 */
function killOne(index) {
    const childProcess = processes[parseInt(index)];
    if (childProcess.pid) killProcessForce(childProcess.pid);
    childProcess.kill();

    try {
    } catch (error) {
        console.log(` - ${colors.FgRed}Error:${colors.Reset} Failed to kill process ${childProcess.pid}`);
        process.exit();
    }
}

/**
 * Kill a process by PID
 * @param {number} pid
 */
function killProcessForce(pid) {
    if (typeof pid !== "number") {
        return;
    }
    try {
        if (process.platform.match(/win/i)) {
            execSync(`taskkill /F /PID ${pid} /T`);
        } else {
            execSync(`kill -9 ${pid}`);
        }
    } catch (error) {}
}

console.log(` - ${colors.FgGreen}Started ${processes.length} processes${colors.Reset}`);
startProcesses();
