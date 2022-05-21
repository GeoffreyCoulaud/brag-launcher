const child_process = require("child_process");

const ad = require("../utils/appDirectories.js");

const Process = require("./Process.js");

/**
 * A promise version of the child_process execFile
 */
function execFilePromise(command, args = [], options = {}){
	return new Promise((resolve, reject)=>{
		child_process.execFile(command, args, options, (error, stdout, stderr)=>{
			if (error) reject(error);
			else resolve(stdout, stderr);
		});
	});
}

/**
 * A wrapper for lutris game process management
 * @property {string} gameSlug - A lutris game slug, used to invoke lutris
 */
class LutrisProcess extends Process {

	command = "sh";

	/**
	 * Create a lutris game process container
	 * @param {string} gameSlug - A lutris game slug
	 */
	constructor(gameSlug) {
		super();
		this.gameSlug = gameSlug;
	}

	/**
	* Get a start script for a lutris game
	* @param {string} gameSlug - The lutris game's slug for which to get a start script
	* @param {string} scriptBaseName - Name (with extension) for the output script file
	* @returns {string} - An absolute path to the script
	*/
	static async getStartScript(gameSlug, scriptBaseName = "") {
		if (!scriptBaseName) scriptBaseName = `lutris-${gameSlug}.sh`;
		const scriptPath = `${ad.APP_START_SCRIPTS_DIR}/${scriptBaseName}`;
		await execFilePromise("lutris", [gameSlug, "--output-script", scriptPath]);
		return scriptPath;
	}

	/**
	 * Start the game in a subprocess
	 */
	async start() {
		const scriptPath = await this.constructor.getStartScript(this.gameSlug);
		this.process = child_process.spawn(
			this.command,
			[scriptPath],
			this.spawnOptions
		);
		this._bindProcessEvents();
		return;
	}

}

module.exports = LutrisProcess;