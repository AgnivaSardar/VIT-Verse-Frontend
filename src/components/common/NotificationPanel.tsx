import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { notificationsApi, type Notification } from '../../services/notificationsApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import './NotificationPanel.css';

interface NotificationPanelProps {
  onClose?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await notificationsApi.getUserNotifications(Number(user.id));
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await notificationsApi.getUnreadCount(Number(user.id));
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.notifID) return;
    try {
      await notificationsApi.markAsRead(notif.notifID);
      setNotifications(prev =>
        prev.map(n => (n.notifID === notif.notifID ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationsApi.markAllAsRead(Number(user.id));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
      console.error(error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      await handleMarkAsRead(notif);
    }
  };

  const handleDelete = async (notifID: number) => {
    try {
      await notificationsApi.delete(notifID);
      setNotifications(prev => prev.filter(n => n.notifID !== notifID));
      toast.success('Notification deleted');
      if (selectedNotification?.notifID === notifID) {
        setSelectedNotification(null);
      }
    } catch (error) {
      toast.error('Failed to delete notification');
      console.error(error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upload_success':
        return '✅';
      case 'upload_failed':
        return '❌';
      case 'video_processed':
        return '🎬';
      case 'comment':
        return '💬';
      case 'reply':
        return '↩️';
      case 'mention':
        return '@';
      case 'milestone':
        return '🎉';
      case 'admin_message':
        return '👮';
      default:
        return '🔔';
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="notification-panel">
        <div className="notification-header">
          <h3>
            <FaBell /> Notifications
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-btn" title="Mark all as read">
                <FaCheckDouble />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="close-btn">
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <FaBell size={48} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.notifID}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notification-icon" style={{ borderColor: getPriorityColor(notif.priority) }}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">
                    {new Date(notif.createdAt || '').toLocaleString()}
                  </span>
                  {notif.category && (
                    <span className={`notification-category category-${notif.category}`}>
                      {notif.category}
                    </span>
                  )}
                </div>
                <div className="notification-item-actions">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif);
                      }}
                      className="mark-read-btn"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (notif.notifID) handleDelete(notif.notifID);
                    }}
                    className="delete-btn"
                    title="Delete"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h3>{getNotificationIcon(selectedNotification.type)} Notification Details</h3>
              <button onClick={() => setSelectedNotification(null)} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="notification-modal-content">
              <div className="notification-modal-priority" style={{ backgroundColor: getPriorityColor(selectedNotification.priority) }}>
                Priority: {selectedNotification.priority || 'normal'}
              </div>
              <p className="notification-modal-message">{selectedNotification.message}</p>
              {selectedNotification.metadata && (
                <div className="notification-modal-metadata">
                  <h4>Additional Details:</h4>
                  <pre>{JSON.stringify(selectedNotification.metadata, null, 2)}</pre>
                </div>
              )}
              <div className="notification-modal-footer">
                <span>Created: {new Date(selectedNotification.createdAt || '').toLocaleString()}</span>
                {selectedNotification.category && (
                  <span className={`notification-category category-${selectedNotification.category}`}>
                    {selectedNotification.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationPanel;
