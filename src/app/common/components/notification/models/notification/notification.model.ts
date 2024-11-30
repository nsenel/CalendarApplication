export enum NotificationType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

// Convert the interface to a class
export class NotificationMessage {
    message: string;
    type: NotificationType;
    duration: number;

    constructor(message: string, type: NotificationType, duration: number = 4000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
    }
}