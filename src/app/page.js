"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useSelector } from 'react-redux';

export default function Home() {
  
  const devices = useSelector(state => state.devices)
  console.log(devices)
  
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        Monitoring
      </div>
      <h2>Список комп'ютерів:</h2>
            <ul>
                {devices.map(device => (
                    <li key={device.id} className="styles.deviceItem">
                        <h3>{device.name}</h3>
                        <p>IP: {device.id}</p>
                        <div className={styles.discsList}>
                          Диски: 
                          {device.discs && device.discs.map( disc => (
                            <div className="discItem">
                              {disc.name} - {disc.size} - {disc.use} - {disc.cript ? 'зашифрований' : 'не зашифрований'} - {disc.block ? 'заблокований' : 'не заблокований'}
                            </div>
                          ))}
                        </div>
                    </li>
                ))}
            </ul>

    
    </main>
  );
}
