import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../../sevices/notification/notification.service';
import { NotificationMessage, NotificationType } from '../../models/notification/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notifications: Observable<NotificationMessage[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications = this.notificationService.notifications;
  }

  getAlertClass(type: NotificationType): { [key: string]: boolean } {
    return {
      'alert': true,
      'alert-info': type === NotificationType.Info,
      'alert-success': type === NotificationType.Success,
      'alert-warning': type === NotificationType.Warning,
      'alert-error': type === NotificationType.Error
    };
  }

  removeNotification(notification: NotificationMessage): void {
    this.notificationService.removeNotification(notification);
  }
}