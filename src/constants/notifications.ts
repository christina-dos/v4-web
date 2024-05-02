import { StatusResponse } from '@0xsquid/sdk';

import { TradeTypes } from './trade';

/** implemented in useNotificationTypes */
export enum NotificationType {
  AbacusGenerated = 'AbacusGenerated',
  SquidTransfer = 'SquidTransfer',
  TriggerOrder = 'TriggerOrder',
  ReleaseUpdates = 'ReleaseUpdates',
  ApiError = 'ApiError',
  ComplianceAlert = 'ComplianceAlert',
  OrderStatus = 'OrderStatus',
}

export enum NotificationCategoryPreferences {
  General = 'General', // release updates
  Transfers = 'Transfers', // transfers
  Trading = 'Trading', // order status, positions / liquidations, trading rewards
  MustSee = 'MustSee', // cannot be hidden: compliance, api errors
}

export const NotificationTypeCategory: {
  [key in NotificationType]: NotificationCategoryPreferences;
} = {
  [NotificationType.ReleaseUpdates]: NotificationCategoryPreferences.General,
  [NotificationType.SquidTransfer]: NotificationCategoryPreferences.Transfers,
  [NotificationType.AbacusGenerated]: NotificationCategoryPreferences.Trading,
  [NotificationType.TriggerOrder]: NotificationCategoryPreferences.Trading,
  [NotificationType.OrderStatus]: NotificationCategoryPreferences.Trading,
  [NotificationType.ApiError]: NotificationCategoryPreferences.MustSee,
  [NotificationType.ComplianceAlert]: NotificationCategoryPreferences.MustSee,
};

export const SingleSessionNotificationTypes = [
  NotificationType.AbacusGenerated,
  NotificationType.ApiError,
  NotificationType.ComplianceAlert,
  NotificationType.OrderStatus,
];

export enum NotificationComponentType {}

export type NotificationId = string | number;

export type NotificationTypeConfig<
  NotificationIdType extends NotificationId = string,
  NotificationUpdateKey = any
> = {
  type: NotificationType;

  /** React hook to trigger notifications based on app state */
  useTrigger: (_: {
    trigger: (
      /** Unique ID for the triggered notification */
      id: NotificationIdType,

      /** Display data for the triggered notification */
      displayData: NotificationDisplayData,

      /**
       * JSON-serializable key.
       * Re-triggers the notification if passed a different value from the last trigger() call (even from a previous browser session).
       * Suggested usage: data dependency array
       */
      updateKey?: NotificationUpdateKey,

      /**
       * @param true (default): Notification initialized with status NotificationStatus.Triggered
       * @param false: Notification initialized with status NotificationStatus.Cleared
       */
      isNew?: boolean
    ) => void;

    lastUpdated: number;
  }) => void;

  /** Callback for notification action (Toast action button click, NotificationsMenu item click, or native push notification interaction) */
  useNotificationAction?: () => (id: NotificationIdType) => any;
};

export enum NotificationStatus {
  /** Notification triggered for the first time. Toast timer started. "New" in NotificationsMenu. */
  Triggered,

  /** Notification re-triggered with a different NotificationUpdateKey. Toast timer restarted. "New" in NotificationsMenu. */
  Updated,

  /** Toast timer expired without user interaction. "New" in NotificationsMenu. */
  Unseen,

  /** Toast or NotificationsMenu item interacted with or dismissed. "Seen" in NotificationsMenu. */
  Seen,

  /** Notification marked for deletion. Hidden in NotificationsMenu. */
  Cleared,
}

/** Notification state. Serialized and cached into localStorage. */
export type Notification<
  NotificationIdType extends NotificationId = string,
  NotificationUpdateKey = any
> = {
  id: NotificationIdType;
  type: NotificationType;
  status: NotificationStatus;
  timestamps: Partial<Record<NotificationStatus, number>>;
  updateKey: NotificationUpdateKey;
};

export type Notifications = Record<NotificationId, Notification<any>>;

/** Notification display data derived from app state at runtime. */
export type NotificationDisplayData = {
  icon?: React.ReactNode;
  title: string; // Title for Toast, Notification, and Push Notification
  body?: string; // Description body for Toast, Notification, and Push Notification

  slotTitleLeft?: React.ReactNode;
  slotTitleRight?: React.ReactNode;

  groupKey: string; // Grouping key toast notification stacking

  // Overrides title/body for Notification in NotificationMenu
  renderCustomBody?: ({
    isToast,
    notification,
  }: {
    isToast?: boolean;
    notification: Notification;
  }) => React.ReactNode; // Custom Notification

  actionDescription?: string;

  renderActionSlot?: ({
    isToast,
    notification,
  }: {
    isToast?: boolean;
    notification: Notification;
  }) => React.ReactNode; // Custom Notification

  /** Screen reader: instructions for performing toast action after its timer expires */
  actionAltText?: string;

  /**
   * @param foreground
     Screen reader: announces immediately.
     Push notification: vibrates device.
   * @param background
     Screen reader: announces at the next graceful opportunity.
     Push notification: no vibration.
   */
  toastSensitivity?: 'foreground' | 'background';

  /**
   * @param number
     Radix UI Toast: automatically Unseen.
     Push notification: requires interaction.
   * @param Infinity
     Radix UI Toast: no timer.
     Push notification: requires interaction.
   */
  toastDuration?: number;

  withClose?: boolean; // Show close button for Notification
};

export enum TransferNotificationTypes {
  Withdrawal = 'withdrawal',
  Deposit = 'deposit',
}

export type TransferNotifcation = {
  txHash: string;
  type?: TransferNotificationTypes;
  toChainId?: string;
  fromChainId?: string;
  toAmount?: number;
  triggeredAt?: number;
  isCctp?: boolean;
  errorCount?: number;
  status?: StatusResponse;
  isExchange?: boolean;
  requestId?: string;
};

export enum TriggerOrderNotificationTypes {
  Created = 'created',
  Cancelled = 'cancelled',
}

export enum TriggerOrderStatus {
  Success = 'success',
  Error = 'error',
}

export type TriggerOrderNotification = {
  assetId: string;
  clientId: number;
  orderType?: TradeTypes;
  price?: number;
  status: TriggerOrderStatus;
  tickSizeDecimals?: number;
  type: TriggerOrderNotificationTypes;
};

export enum ReleaseUpdateNotificationIds {
  RevampedConditionalOrders = 'revamped-conditional-orders',
  IncentivesS4 = 'incentives-s4',
  IncentivesDistributedS3 = 'incentives-distributed-s3',
}

/**
 * @description Struct to store whether a NotificationType belonging to each NotificationCategoryType should be triggered
 */
export type NotificationPreferences = {
  [key in NotificationCategoryPreferences]: boolean;
} & { version: string };

export const DEFAULT_TOAST_AUTO_CLOSE_MS = 5000;
