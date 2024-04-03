import { log } from 'console';
import { promises as fs } from 'fs';

interface CPUInfo {
    model: string;
    load: number;
    history: number[];
}

interface RAMInfo {
    total: number;
    used: number;
    procent: number;
    history: number[];
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
    online: boolean;
    timeLastInfo: Date;
}

export class Devices {
    private list: Device[] = [];
    private filename: string = 'devices.json'; // Путь к файлу для сохранения данных
    private callback: (device: Object) => void; // Объявляем тип callback функции
    
    constructor(callback: (device: Device) => void) {
        this.callback = callback;
        this.init();
    }

    private async init() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.list = JSON.parse(data);

            this.list.forEach((device) => {
                device.timeLastInfo = new Date(device.timeLastInfo);
            });

        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('Файл devices.json не найден. Будет создан новый при первом сохранении.');
                this.list = []; // Инициализация пустым массивом
            } else {
                console.error('Ошибка при чтении файла:', err);
            }
        }

        setInterval(() => {
            this.checkIsOffline();
          }, 15000); // 10000 миллисекунд = 10 секунд
    }
    
    private checkIsOffline() {
        console.log('Эта функция вызывается каждые 15 секунд');
        
        try {
            const currTime : Date = new Date(); 
        
            this.list.forEach((device) => {
                try {
                    const lastTime = device.timeLastInfo || new Date(0);                  
                    const diffTime = (currTime.getTime() - lastTime.getTime()) / 1000;
                    
                    if (diffTime > 25) {
                        this.setProperty(device, 'online', false);
                    }

                    console.log(device.name, device.online ,'diffTime', diffTime, lastTime);
                } catch (error) {
                    this.setProperty(device, 'online', false);
                }
                
            });
        } catch (error) {
            console.error('checkIsOffline', error);
        }
    }

    getList(): Device[] {
        return this.list.slice();
    }

    async updateInfo(payload: Device): Promise<void> {
        payload.timeLastInfo = new Date();
        payload.online = true;
        
        try {
            const index = this.list.findIndex((item) => item.id === payload.id);
            if (index >= 0) {
                const device = this.list[index];

                payload.CPU.history = [ ...[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ...device.CPU.history||[]].slice(-15);
                payload.CPU.history.push(payload.CPU.load);

                payload.RAM.history = [ ...[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ...device.RAM.history||[]].slice(-15);
                payload.RAM.history.push(payload.RAM.procent);

                this.list[index] = payload;
                this.callback({topic: 'info', payload: payload});
            } else {
                payload.CPU.history = [payload.CPU.load];
                payload.RAM.history = [payload.RAM.procent];

                this.list.push(payload);
            }

            await this.saveToFile();
        } catch (error) {
            console.error('ERROR - updateInfo', error)
        }
    }

    private async saveToFile(): Promise<void> {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.list, null, 2), 'utf8');
        } catch (err) {
            console.error('Ошибка при записи в файл:', err);
        }
    }

    private setProperty(device:Device, property:string, newValue:any){
        if(device[property] !== newValue){
            device[property] = newValue;
            this.callback({topic: 'info', payload: device});
        }
    }

    setOffline(id:string){
        try {
            const index = this.list.findIndex((item) => item.id === id);

            if (index >= 0) {
                const device = this.list[index];

                device.online = false;
                this.callback({topic: 'info', payload: device});
            }

        } catch (error) {
            console.error('ERROR - setOffline', error)
        }
    }
}












