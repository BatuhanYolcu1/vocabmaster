import { prisma } from './prisma';

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return setting ? setting.value : defaultValue;
    } catch (e) {
        console.error(`Failed to get system setting ${key}:`, e);
        return defaultValue;
    }
}

export async function isMaintenanceMode(): Promise<boolean> {
    const val = await getSystemSetting('MAINTENANCE_MODE', 'false');
    return val === 'true';
}

export async function isAIEnabled(): Promise<boolean> {
    const val = await getSystemSetting('AI_ENABLED', 'true');
    return val !== 'false';
}

export async function isRegistrationEnabled(): Promise<boolean> {
    const val = await getSystemSetting('REGISTRATION_ENABLED', 'true');
    return val !== 'false';
}
