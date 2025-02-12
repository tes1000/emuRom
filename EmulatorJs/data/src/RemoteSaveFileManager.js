class RemoteSaveFileManager {
    constructor(Module) {
        this.Module = Module;
        this.FS = this.Module.FS;
    }

    getSaveFilePath() {
        return this.Module.cwrap('save_file_path', 'string', [])();
    }

    saveSaveFiles() {
        console.log("DEBUG: Saving save files");
        this.Module.cwrap('cmd_savefiles', '', [])();
    }

    loadSaveFiles() {
        console.log("DEBUG: Loading save files");
        this.Module.cwrap('refresh_save_files', 'null', [])();
    }

    getSaveFile() {
        console.log("DEBUG: Retrieving save file");
        this.saveSaveFiles();
        const saveFilePath = this.getSaveFilePath();
        const exists = this.FS.analyzePath(saveFilePath).exists;
        return exists ? this.FS.readFile(saveFilePath) : null;
    }

    deleteSaveFile() {
        try {
            const saveFilePath = this.getSaveFilePath();
            if (this.FS.analyzePath(saveFilePath).exists) {
                this.FS.unlink(saveFilePath);
                console.log("DEBUG: Save file deleted");
            }
        } catch (e) {
            console.warn("Failed to delete save file:", e);
        }
    }
}

export default RemoteSaveFileManager;
