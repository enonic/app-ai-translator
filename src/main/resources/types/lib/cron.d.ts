declare global {
    interface XpLibraries {
        '/lib/cron': typeof import('./cron');
    }
}

export interface CronScheduleParams {
    name: string;
    fixedDelay: number;
    delay: number;
    times?: number;
    callback: () => void;
}

export interface CronUnscheduleParams {
    name: string;
}

export interface Cron {
    schedule: (params: CronScheduleParams) => void;
    unschedule: (params: CronUnscheduleParams) => void;
}

declare const cron: Cron;

export default cron;
