import { CronJob } from 'cron';

export class Scheduler {
    private static jobs: CronJob[] = [];
    private static timezone = 'Asia/Shanghai';

    static Cron(expression: string) {
        return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
            
            const job = new CronJob(
                expression,
                async () => {
                    try {
                        await originalMethod.apply(target);
                    } catch (err) {
                        console.error('定时任务执行失败:', err);
                    }
                },
                null,
                true,
                Scheduler.timezone
            );
            
            Scheduler.jobs.push(job);
            return descriptor;
        };
    }

    static setTimezone(timezone: string) {
        this.timezone = timezone;
    }
}
