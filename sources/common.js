import { readdirAsync } from "readdir-enhanced";
import { join as pathJoin } from "path";
import { EventEmitter } from "events";
import { kill } from "process";

export class GameProcessContainer extends EventEmitter{
	static defaultSpawnOptions = {
		detached: true,
	}
	
	process = undefined;
	isRunning = false;

	_bindProcessEvents(){
		this.process.on("spawn", ()=>{
			this.isRunning = true;
			this.emit("spawn");
		});
		this.process.on("error", (error)=>{
			this.isRunning = false;
			this.emit("error", error);
		});
		this.process.on("exit", (code, signal)=>{
			this.isRunning = false;
			this.emit("exit", code, signal);
		});
	}

	sendSignal(signal, wholeGroup = false){
		if (!this.process.pid){
			console.error(`Could not signal ${this.process.pid}${wholeGroup?"(group)":""} ${signal}`);
			return false;
		}
		try {
			let pidToKill = this.process.pid;
			if (wholeGroup) pidToKill *= -1; // negative PID means send to all process in group
			kill(pidToKill, signal);
		} catch (error){
			console.error(`Error while signaling ${this.process.pid}${wholeGroup?"(group)":""} ${signal} : ${error}`);
			return false;
		}
		return true;
	}
	
	kill(){
		if (!this.isRunning){ return true; }
		const hasKilled = this.sendSignal("SIGKILL", true);
		if (hasKilled) this.isRunning = false;
		return hasKilled;
		
	}
	
	stop(){
		if (!this.isRunning){ return true; }
		const hasStopped = this.sendSignal("SIGTERM", true);
		if (hasStopped) this.isRunning = false;
		return hasStopped;
	}

}

export class Game{
	source = "Unknown";
	
	processContainer = new GameProcessContainer();
	isRunning = false;
	
	constructor(name){
		this.name = name;
	}
}

export class GameDir {
	constructor(path, recursive = false) {
		this.path = path;
		this.recursive = recursive;
	}
}

export class EmulatedGame extends Game{
	constructor(name, path, source = "Unknown", console = "Unknown"){
		super(name);
		this.path = path;
		this.source = source;
		this.console = console;
	}
	toString(){
		return `${this.name} - ${this.source} (${this.console})`;
	}
}

export async function getROMs(dirs, filesRegex, warn = false){
	let paths = [];

	// Get roms
	for (let dir of dirs){
		
		// Get all the files in dir recursively
		let filePaths;
		try {
			filePaths = await readdirAsync(dir.path, {filter: filesRegex, deep: dir.recursive});
		} catch (error){
			if (warn) console.warn(`Skipping directory ${dir.path} (${error})`);
			continue;
		}

		// Filter to keep only game files
		if (filePaths.length === 0) console.warn(`No game files in "${dir.path}"${dir.recursive ? " (recursively)" : ""}`);

		// Add games
		for (let file of filePaths){
			let fileAbsPath = pathJoin(dir.path, file);
			paths.push(fileAbsPath);
		}

	}

	return paths;

}