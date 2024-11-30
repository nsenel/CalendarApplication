import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationMessage } from '../../models/notification/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  notifications = this.notificationsSubject.asObservable();

  showNotification(notification: NotificationMessage) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Automatically remove the notification after the specified duration
    if (notification.duration>0)
    {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    }
    
  }

  removeNotification(notificationToRemove: NotificationMessage) {
    const currentNotifications = this.notificationsSubject.value.filter(notification => notification !== notificationToRemove);
    this.notificationsSubject.next(currentNotifications);
  }

  clearNotifications() {
    this.notificationsSubject.next([]);
  }
}