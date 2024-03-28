import { promises as fs } from 'fs';

interface CPUInfo {
    model: string;
    load: number;
}

interface RAMInfo {
    total: number;
    used: number;
    procent: number;
}

interface DiskInfo {
    mounted: string;
    total: number;
    used: number;
    available: number;
    procent: number;
    crypt: boolean;
    locked: boolean;
}

interface Device {
    role: string;
    name: string;
    uptime: string;
    network: string[];
    CPU: CPUInfo;
    RAM: RAMInfo;
    disk: DiskInfo[];
    id: string;
}

export class Devices {
    private list: Device[] = [];
    private filename: string = 'devices.json'; // Путь к файлу для сохранения данных

    constructor() {
        this.init();
    }

    private async init() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.list = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('Файл devices.json не найден. Будет создан новый при первом сохранении.');
                this.list = []; // Инициализация пустым массивом
            } else {
                console.error('Ошибка при чтении файла:', err);
            }
        }
    }

    getList(): Device[] {
        return this.list.slice();
    }

    async updateInfo(payload: Device): Promise<void> {
        const index = this.list.findIndex((item) => item.id === payload.id);
        if (index >= 0) {
            this.list[index] = payload;
        } else {
            this.list.push(payload);
        }

        await this.saveToFile();
    }

    private async saveToFile(): Promise<void> {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.list, null, 2), 'utf8');
        } catch (err) {
            console.error('Ошибка при записи в файл:', err);
        }
    }

}












