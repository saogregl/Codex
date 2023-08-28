import * as dialog from '@tauri-apps/api/dialog';
import { desktopDir } from '@tauri-apps/api/path';

export const openDirectoryDialog = async () => {
    const desktopDirPath = await desktopDir();
    const dirPath = await dialog.open({
        title: "Abrir diretório",
        directory: true,
        multiple: false,
        defaultPath: desktopDirPath,
    });
    return dirPath;
};
