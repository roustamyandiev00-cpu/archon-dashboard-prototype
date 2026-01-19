import { useState, useEffect } from "react";
import { Bell, Check, X, AlertCircle, Info, CheckCircle, DollarSign, Calendar, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type NotificationType = "payment" | "deadline" | "info" | "warning" | "success" | "task";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  priority?: "low" | "medium" | "high";
  actionUrl?: string;
}

interface NotificationCenterProps {
  initialNotifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  payment: <DollarSign className="h-4 w-4 text-cyan-400" />,
  deadline: <Calendar className="h-4 w-4 text-purple-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-400" />,
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  task: <FileText className="h-4 w-4 text-cyan-400" />
};

const notificationColors: Record<NotificationType, string> = {
  payment: "border-l-cyan-500/50 bg-cyan-500/5",
  deadline: "border-l-purple-500/50 bg-purple-500/5",
  info: "border-l-blue-500/50 bg-blue-500/5",
  warning: "border-l-yellow-500/50 bg-yellow-500/5",
  success: "border-l-green-500/50 bg-green-500/5",
  task: "border-l-cyan-500/50 bg-cyan-500/5"
};

const priorityColors: Record<"low" | "medium" | "high", string> = {
  low: "text-muted-foreground",
  medium: "text-blue-400",
  high: "text-red-400"
};

const defaultNotifications: Notification[] = [];

export function NotificationCenter({
  initialNotifications = defaultNotifications,
  onNotificationClick,
  onMarkAllRead,
  onClearAll
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    onMarkAllRead?.();
  };

  const handleClearAll = () => {
    setNotifications([]);
    onClearAll?.();
  };

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    onNotificationClick?.(notification);
    if (notification.actionUrl) {
      // Navigate to action URL
      window.location.href = notification.actionUrl;
    }
  };

  // Group notifications by read/unread
  const unreadNotifications = notifications.filter(n => n.unread);
  const readNotifications = notifications.filter(n => !n.unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="notification-badge"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[400px] p-0 glass-card border-white/10" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Notificaties</h3>
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                {unreadCount} nieuw
              </Badge>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 text-xs hover:text-cyan-400"
                disabled={unreadCount === 0}
              >
                <Check className="h-3 w-3 mr-1" />
                Markeer alles gelezen
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs hover:text-red-400"
              >
                <X className="h-3 w-3 mr-1" />
                Wis alles
              </Button>
            </div>
          )}
        </div>
        
        {/* Notifications List */}
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-4 rounded-full bg-white/5 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Geen notificaties</p>
              <p className="text-xs text-muted-foreground">Je bent helemaal bij!</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Unread Notifications */}
              {unreadNotifications.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ongelezen
                    </p>
                  </div>
                  <AnimatePresence>
                    {unreadNotifications.map((notification, index) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onRemove={(e) => handleRemoveNotification(notification.id, e)}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Read Notifications */}
              {readNotifications.length > 0 && (
                <div>
                  {unreadNotifications.length > 0 && (
                    <>
                      <Separator className="my-2 bg-white/5" />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Eerder
                        </p>
                      </div>
                    </>
                  )}
                  <AnimatePresence>
                    {readNotifications.map((notification, index) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onRemove={(e) => handleRemoveNotification(notification.id, e)}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  index: number;
}

function NotificationItem({ notification, onClick, onRemove, index }: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative p-3 mb-1.5 rounded-lg cursor-pointer transition-all",
        "border-l-2 hover:bg-white/5",
        notificationColors[notification.type],
        notification.unread && "bg-white/5"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={cn(
            "p-2 rounded-lg",
            notification.type === "payment" && "bg-cyan-500/10",
            notification.type === "deadline" && "bg-purple-500/10",
            notification.type === "info" && "bg-blue-500/10",
            notification.type === "warning" && "bg-yellow-500/10",
            notification.type === "success" && "bg-green-500/10",
            notification.type === "task" && "bg-cyan-500/10"
          )}>
            {notificationIcons[notification.type]}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm leading-tight">
              {notification.title}
            </h4>
            {notification.priority && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] h-4 px-1.5 border-current",
                  priorityColors[notification.priority]
                )}
              >
                {notification.priority}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {notification.description}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {notification.time}
            </p>
            {notification.unread && (
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
          aria-label="Remove notification"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
